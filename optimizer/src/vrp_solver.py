from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from datetime import datetime, timedelta
from typing import Optional
import math

from .models import (
    EmployeeInput,
    TaskInput,
    ClientInput,
    OptimizeConfig,
    RouteOutput,
    AssignmentOutput,
)
from .utils import haversine_distance


class VRPSolver:
    def __init__(
        self,
        employees: list[EmployeeInput],
        tasks: list[TaskInput],
        clients: list[ClientInput],
        config: OptimizeConfig,
    ):
        self.employees = employees
        self.tasks = tasks
        self.clients = clients
        self.config = config
        
        self.client_map = {c.id: c for c in clients}
        self.task_map = {t.id: t for t in tasks}
        
        self.locations: list[tuple[float, float]] = []
        self.location_to_task: dict[int, Optional[str]] = {}
        
        self._build_location_list()

    def _build_location_list(self):
        """Build list of all locations (depots + task locations)."""
        for emp in self.employees:
            if emp.homeLocation:
                self.locations.append((emp.homeLocation.lat, emp.homeLocation.lng))
            else:
                self.locations.append((55.6761, 12.5683))
            self.location_to_task[len(self.locations) - 1] = None
        
        for task in self.tasks:
            client = self.client_map.get(task.clientId)
            if client:
                self.locations.append((client.location.lat, client.location.lng))
                self.location_to_task[len(self.locations) - 1] = task.id

    def _compute_distance_matrix(self) -> list[list[int]]:
        """Compute distance matrix in meters between all locations."""
        n = len(self.locations)
        matrix = [[0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = haversine_distance(
                        self.locations[i][0], self.locations[i][1],
                        self.locations[j][0], self.locations[j][1]
                    )
                    matrix[i][j] = int(dist * 1000)
        
        return matrix

    def _compute_time_matrix(self, distance_matrix: list[list[int]]) -> list[list[int]]:
        """Convert distance matrix to time matrix (in minutes)."""
        avg_speed_kmh = 30
        if self.config.includeTraffic:
            avg_speed_kmh = avg_speed_kmh / self.config.trafficMultiplier
        
        avg_speed_m_per_min = (avg_speed_kmh * 1000) / 60
        
        n = len(distance_matrix)
        time_matrix = [[0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    time_matrix[i][j] = max(1, int(distance_matrix[i][j] / avg_speed_m_per_min))
        
        return time_matrix

    def _can_perform_task(self, employee: EmployeeInput, task: TaskInput) -> bool:
        """Check if employee has required competencies for task."""
        emp_competencies = set(employee.competencies)
        required = set(task.requiredCompetencies)
        return required.issubset(emp_competencies)

    def solve(self) -> list[RouteOutput]:
        """Solve the VRP and return optimized routes."""
        if not self.tasks or not self.employees:
            return []

        num_vehicles = len(self.employees)
        num_locations = len(self.locations)
        depot_indices = list(range(num_vehicles))

        distance_matrix = self._compute_distance_matrix()
        time_matrix = self._compute_time_matrix(distance_matrix)

        manager = pywrapcp.RoutingIndexManager(
            num_locations,
            num_vehicles,
            depot_indices,
            depot_indices,
        )
        routing = pywrapcp.RoutingModel(manager)

        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            travel_time = time_matrix[from_node][to_node]
            
            task_id = self.location_to_task.get(to_node)
            service_time = 0
            if task_id:
                task = self.task_map.get(task_id)
                if task:
                    service_time = task.durationMinutes
            
            return travel_time + service_time

        transit_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        routing.AddDimension(
            transit_callback_index,
            30,
            600,
            False,
            "Time",
        )
        time_dimension = routing.GetDimensionOrDie("Time")

        for vehicle_id, employee in enumerate(self.employees):
            start_index = routing.Start(vehicle_id)
            end_index = routing.End(vehicle_id)
            
            work_minutes = employee.workEndMinutes - employee.workStartMinutes
            time_dimension.CumulVar(start_index).SetRange(0, 0)
            time_dimension.CumulVar(end_index).SetRange(0, work_minutes)

        for location_idx in range(num_vehicles, num_locations):
            task_id = self.location_to_task.get(location_idx)
            if not task_id:
                continue
            
            task = self.task_map.get(task_id)
            if not task:
                continue

            node_index = manager.NodeToIndex(location_idx)
            
            allowed_vehicles = []
            for vehicle_id, employee in enumerate(self.employees):
                if self._can_perform_task(employee, task):
                    allowed_vehicles.append(vehicle_id)
            
            if allowed_vehicles:
                routing.SetAllowedVehiclesForIndex(allowed_vehicles, node_index)
            else:
                routing.AddDisjunction([node_index], 100000)

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = self.config.timeoutSeconds

        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return self._create_fallback_routes()

        return self._extract_routes(manager, routing, solution, distance_matrix, time_matrix)

    def _extract_routes(
        self,
        manager: pywrapcp.RoutingIndexManager,
        routing: pywrapcp.RoutingModel,
        solution: pywrapcp.Assignment,
        distance_matrix: list[list[int]],
        time_matrix: list[list[int]],
    ) -> list[RouteOutput]:
        """Extract route information from OR-Tools solution."""
        routes = []
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        for vehicle_id, employee in enumerate(self.employees):
            assignments = []
            total_distance = 0
            total_time = 0
            order = 0

            index = routing.Start(vehicle_id)
            prev_node = manager.IndexToNode(index)
            
            current_time = employee.workStartMinutes

            while not routing.IsEnd(index):
                next_index = solution.Value(routing.NextVar(index))
                node = manager.IndexToNode(next_index)
                
                task_id = self.location_to_task.get(node)
                
                if task_id:
                    task = self.task_map.get(task_id)
                    if task:
                        travel_time = time_matrix[prev_node][node]
                        current_time += travel_time
                        
                        start_time = today + timedelta(minutes=current_time)
                        end_time = start_time + timedelta(minutes=task.durationMinutes)
                        
                        assignments.append(AssignmentOutput(
                            taskId=task_id,
                            clientId=task.clientId,
                            order=order,
                            startTime=start_time.isoformat(),
                            endTime=end_time.isoformat(),
                            travelMinutes=travel_time,
                        ))
                        
                        current_time += task.durationMinutes
                        total_distance += distance_matrix[prev_node][node]
                        total_time += travel_time + task.durationMinutes
                        order += 1
                
                prev_node = node
                index = next_index

            work_duration = employee.workEndMinutes - employee.workStartMinutes
            efficiency = (total_time / work_duration) if work_duration > 0 else 0

            routes.append(RouteOutput(
                employeeId=employee.id,
                employeeName=employee.name,
                assignments=assignments,
                totalDistanceKm=round(total_distance / 1000, 2),
                totalDurationMinutes=total_time,
                efficiency=round(efficiency, 2),
            ))

        return routes

    def _create_fallback_routes(self) -> list[RouteOutput]:
        """Create basic routes when optimization fails."""
        routes = []
        task_queue = list(self.tasks)
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        for employee in self.employees:
            assignments = []
            current_time = employee.workStartMinutes
            order = 0

            assignable_tasks = [
                t for t in task_queue
                if self._can_perform_task(employee, t)
            ]

            for task in assignable_tasks[:5]:
                if current_time + task.durationMinutes > employee.workEndMinutes:
                    break

                start_time = today + timedelta(minutes=current_time)
                end_time = start_time + timedelta(minutes=task.durationMinutes)

                assignments.append(AssignmentOutput(
                    taskId=task.id,
                    clientId=task.clientId,
                    order=order,
                    startTime=start_time.isoformat(),
                    endTime=end_time.isoformat(),
                    travelMinutes=10,
                ))

                current_time += task.durationMinutes + 15
                order += 1
                task_queue.remove(task)

            routes.append(RouteOutput(
                employeeId=employee.id,
                employeeName=employee.name,
                assignments=assignments,
                totalDistanceKm=0,
                totalDurationMinutes=sum(a.travelMinutes for a in assignments),
                efficiency=0.5,
            ))

        return routes
