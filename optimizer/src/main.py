from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time

from .vrp_solver import VRPSolver
from .models import OptimizeRequest, OptimizeResponse

app = FastAPI(
    title="Plaain Optimizer",
    description="VRP Optimization Service for Workforce Scheduling",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "optimizer"}


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize_routes(request: OptimizeRequest):
    start_time = time.time()
    
    try:
        solver = VRPSolver(
            employees=request.employees,
            tasks=request.tasks,
            clients=request.clients,
            config=request.config,
        )
        
        routes = solver.solve()
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        return OptimizeResponse(
            success=True,
            routes=routes,
            computation_time_ms=elapsed_ms,
            tasks_assigned=sum(len(r.assignments) for r in routes),
            tasks_unassigned=len(request.tasks) - sum(len(r.assignments) for r in routes),
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/distance-matrix")
async def calculate_distance_matrix(locations: list[dict]):
    """Calculate distance matrix between locations using Haversine formula."""
    from .utils import haversine_distance
    
    n = len(locations)
    matrix = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i != j:
                dist = haversine_distance(
                    locations[i]["lat"], locations[i]["lng"],
                    locations[j]["lat"], locations[j]["lng"]
                )
                matrix[i][j] = int(dist * 1000)
    
    return {"matrix": matrix, "unit": "meters"}
