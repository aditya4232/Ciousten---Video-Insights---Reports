"""
Performance Monitoring Middleware
Track request timing and performance metrics
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
from typing import Callable
import logging

logger = logging.getLogger(__name__)


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to track request performance"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Start timing
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(duration)
        response.headers["X-Request-ID"] = str(id(request))
        
        # Log slow requests (> 1 second)
        if duration > 1.0:
            logger.warning(
                f"Slow request: {request.method} {request.url.path} "
                f"took {duration:.2f}s"
            )
        
        # Record metrics (would integrate with stats endpoint)
        try:
            from app.api.routes.stats import record_request
            record_request(
                endpoint=request.url.path,
                duration=duration,
                status_code=response.status_code
            )
        except Exception:
            pass  # Don't fail request if metrics recording fails
        
        return response
