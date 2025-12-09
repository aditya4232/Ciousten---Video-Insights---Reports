"""
Rate limiting configuration for API endpoints.
Prevents DDoS attacks and mass uploads.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize rate limiter with IP-based tracking
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour"],  # Default: 100 requests per hour
    storage_uri="memory://"  # Use in-memory storage (resets on restart)
)

# Rate limit configurations for different endpoints
RATE_LIMITS = {
    "upload": "5/hour",           # 5 video uploads per hour per IP
    "sample": "10/hour",          # 10 sample loads per hour per IP
    "session": "20/minute",       # 20 session creations per minute per IP
    "analysis": "10/hour",        # 10 AI analyses per hour per IP
    "reports": "20/hour",         # 20 report generations per hour per IP
    "general": "100/hour",        # General API calls
}
