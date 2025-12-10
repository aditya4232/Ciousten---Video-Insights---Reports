# Changelog

All notable changes to Ciousten will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2025-12-10

### Added - Enhanced Features
- **WebSocket Support**
  - Real-time progress updates for video processing
  - Project-specific WebSocket connections
  - System-wide updates channel
  - Live segmentation and analysis progress
  
- **Dataset Export**
  - COCO format export with annotations
  - YOLO format export with labels
  - ZIP download for exported datasets
  - Automatic image and label organization
  
- **Performance Monitoring**
  - Request timing middleware
  - Performance headers (X-Process-Time)
  - Slow request logging (> 1 second)
  - Automatic metrics recording
  
- **Enhanced API**
  - `/api/ws/{project_id}` - WebSocket for project updates
  - `/api/ws/system` - WebSocket for system updates
  - `/api/export/{project_id}/coco` - Export to COCO format
  - `/api/export/{project_id}/yolo` - Export to YOLO format
  - `/api/export/download/{filename}` - Download exports

### Changed
- Enhanced stats endpoint to work with performance middleware
- Improved error handling in export operations
- Better WebSocket connection management

### Performance
- Added performance tracking middleware
- Request timing headers
- Slow request detection and logging



## [1.2.0] - 2025-12-10

### Added - Production Ready Features
- **Enhanced Health Monitoring**
  - Comprehensive `/health` endpoint with system metrics
  - Real-time CPU, memory, and disk usage monitoring
  - Service status checks (database, directories)
  - Active session tracking
  - System Health Widget component for frontend
  
- **Production Optimizations**
  - Added `psutil` for system monitoring
  - Enhanced error handling across all endpoints
  - Improved API response formatting
  - Better logging and diagnostics
  
- **Developer Experience**
  - V1.2 Production Enhancement Plan document
  - Comprehensive implementation roadmap
  - Better code documentation
  - Improved type safety

### Changed
- Updated version to 1.2.0 across all components
- Enhanced root endpoint with more metadata
- Improved health check from basic to comprehensive
- Better system resource monitoring

### Fixed
- Production deployment compatibility
- Health check reliability
- System metrics accuracy
- Resource monitoring edge cases

### Security
- Enhanced system monitoring for security alerts
- Better resource usage tracking
- Improved service health validation

### Performance
- Optimized health check response time
- Reduced memory footprint
- Better resource utilization tracking



## [2.0.0] - 2025-11-30

### Added
- **Modern UI Overhaul**
  - Dark mode support with system preference detection
  - Glassmorphism effects and modern animations
  - Theme toggle button in navigation
  - Smooth transitions and hover effects
  
- **New Dashboard**
  - Statistics overview with animated counters
  - Quick action cards for common tasks
  - Recent activity feed
  - Responsive grid layout
  
- **Enhanced Navigation**
  - Modern navigation bar with glassmorphism
  - Mobile-responsive menu
  - Active tab indicator with smooth animations
  - Consistent across all pages
  
- **Open Source Preparation**
  - MIT License
  - CONTRIBUTING.md with development guidelines
  - Enhanced README with badges and features
  - Code of Conduct (planned)
  
- **Modern Dependencies**
  - Framer Motion for animations
  - Recharts for data visualization
  - React Dropzone for file uploads
  - Date-fns for date formatting

### Changed
- Updated layout to include ThemeProvider
- Improved color scheme with better contrast
- Enhanced typography and spacing
- Modernized all UI components

### Fixed
- React hydration warning in layout.tsx
- Settings page visibility issues
- Console errors and warnings

## [1.0.0] - 2025-11-29

### Added
- **Core Features**
  - Video upload and processing
  - SAM2 + YOLO segmentation
  - OpenRouter AI analysis
  - Excel and PDF report generation
  
- **Frontend Pages**
  - Home page with hero section
  - Annotate page for video upload
  - Analyze page for AI insights
  - Reports page for downloads
  - Settings page with configuration
  
- **Backend API**
  - FastAPI server
  - SQLite database
  - RESTful endpoints
  - Background task processing
  
- **Docker Support**
  - Docker Compose configuration
  - Multi-stage builds
  - Development and production modes
  
- **Documentation**
  - Comprehensive README
  - Setup instructions
  - API documentation
  - Troubleshooting guide

### Technical Stack
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS
- Backend: Python 3.10, FastAPI, SQLAlchemy
- AI: SAM2, YOLO, OpenRouter
- Database: SQLite
- Deployment: Docker

## [Unreleased]

### Planned Features
- Real-time progress tracking with WebSocket
- Batch video processing
- Video preview and timeline editor
- Advanced AI insights dashboard
- Cloud storage integration (S3, GCS, Azure)
- Export to COCO format
- Performance optimizations with Redis caching
- Comprehensive test suite
- CI/CD pipeline

---

**Made by Aditya Shenvi @2025**  
**Website**: www.adityacuz.dev
