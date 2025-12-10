"""
API Statistics and Metrics Endpoint
Provides usage analytics and performance metrics
"""
from fastapi import APIRouter, Request
from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict
import time

router = APIRouter()

# In-memory storage for API metrics (would use Redis in production)
api_metrics: Dict[str, List[float]] = defaultdict(list)
endpoint_calls: Dict[str, int] = defaultdict(int)
error_counts: Dict[str, int] = defaultdict(int)
start_time = time.time()


def record_request(endpoint: str, duration: float, status_code: int):
    """Record API request metrics"""
    api_metrics[endpoint].append(duration)
    endpoint_calls[endpoint] += 1
    if status_code >= 400:
        error_counts[endpoint] += 1


@router.get("/stats")
async def get_api_stats():
    """Get API usage statistics and performance metrics"""
    
    # Calculate uptime
    uptime_seconds = int(time.time() - start_time)
    uptime_hours = uptime_seconds // 3600
    uptime_minutes = (uptime_seconds % 3600) // 60
    
    # Calculate average response times
    avg_response_times = {}
    for endpoint, durations in api_metrics.items():
        if durations:
            avg_response_times[endpoint] = {
                "avg_ms": round(sum(durations) / len(durations) * 1000, 2),
                "min_ms": round(min(durations) * 1000, 2),
                "max_ms": round(max(durations) * 1000, 2),
                "count": len(durations)
            }
    
    # Calculate error rates
    error_rates = {}
    for endpoint, errors in error_counts.items():
        total = endpoint_calls.get(endpoint, 0)
        if total > 0:
            error_rates[endpoint] = round((errors / total) * 100, 2)
    
    # Top endpoints by usage
    top_endpoints = sorted(
        endpoint_calls.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": {
            "seconds": uptime_seconds,
            "formatted": f"{uptime_hours}h {uptime_minutes}m"
        },
        "requests": {
            "total": sum(endpoint_calls.values()),
            "by_endpoint": dict(endpoint_calls)
        },
        "errors": {
            "total": sum(error_counts.values()),
            "by_endpoint": dict(error_counts),
            "error_rates": error_rates
        },
        "performance": {
            "avg_response_times": avg_response_times
        },
        "top_endpoints": [
            {"endpoint": ep, "calls": count}
            for ep, count in top_endpoints
        ]
    }


@router.delete("/stats/reset")
async def reset_stats():
    """Reset all statistics (admin only in production)"""
    global api_metrics, endpoint_calls, error_counts, start_time
    
    api_metrics.clear()
    endpoint_calls.clear()
    error_counts.clear()
    start_time = time.time()
    
    return {
        "message": "Statistics reset successfully",
        "timestamp": datetime.utcnow().isoformat()
    }
