from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Location(BaseModel):
    lat: float
    lng: float


class EmployeeInput(BaseModel):
    id: str
    name: str
    competencies: list[str]
    homeLocation: Optional[Location] = None
    workStartMinutes: int = 480  # 08:00
    workEndMinutes: int = 960    # 16:00
    maxWorkMinutes: int = 444    # 7.4 hours


class TaskInput(BaseModel):
    id: str
    clientId: str
    durationMinutes: int
    requiredCompetencies: list[str]
    windowStart: Optional[str] = None
    windowEnd: Optional[str] = None
    priority: str = "normal"


class ClientInput(BaseModel):
    id: str
    location: Location


class OptimizeConfig(BaseModel):
    timeoutSeconds: int = 30
    includeTraffic: bool = False
    trafficMultiplier: float = 1.2


class OptimizeRequest(BaseModel):
    employees: list[EmployeeInput]
    tasks: list[TaskInput]
    clients: list[ClientInput]
    config: OptimizeConfig = OptimizeConfig()


class AssignmentOutput(BaseModel):
    taskId: str
    clientId: str
    order: int
    startTime: str
    endTime: str
    travelMinutes: int


class RouteOutput(BaseModel):
    employeeId: str
    employeeName: str
    assignments: list[AssignmentOutput]
    totalDistanceKm: float
    totalDurationMinutes: int
    efficiency: float


class OptimizeResponse(BaseModel):
    success: bool
    routes: list[RouteOutput]
    computation_time_ms: int
    tasks_assigned: int
    tasks_unassigned: int
