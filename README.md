# Ciousten – Video Insights & Reports

**Segment, understand, and report on videos with SAM2 + OpenRouter**

Made by [Aditya Shenvi](https://www.adityacuz.dev) @2025

---

## 🎯 Overview

Ciousten is a complete, open-source video analytics platform that enables you to:

- **Upload videos** and run AI-powered segmentation using Meta SAM2 + YOLO
- **Analyze content** using OpenRouter's LLM APIs for natural language insights
- **Generate professional reports** in Excel and PDF formats automatically
- **View interactive visualizations** of object detection and tracking

### Key Features

✨ **Smart Segmentation** - CPU-optimized SAM2 + YOLO detection  
🧠 **AI Analysis** - OpenRouter integration for intelligent insights  
📊 **Auto Reports** - Multi-sheet Excel workbooks with charts  
📄 **PDF Generation** - Professional analysis reports  
🐳 **Docker Ready** - One-command deployment with docker-compose  

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Meta SAM2** - Segment Anything Model 2 for video segmentation
- **Ultralytics YOLO** - Object detection (YOLOv8n)
- **OpenRouter** - LLM API for analysis
- **OpenPyXL** - Excel report generation
- **ReportLab** - PDF report generation
- **SQLite** - Lightweight database

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components

---

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended)
- OR **Python 3.10+** and **Node.js 20+** for manual setup
- **OpenRouter API Key** (get one at [openrouter.ai](https://openrouter.ai))
- **SAM2 Model Weights** (optional, for full segmentation)

---

## 🚀 Quick Start (Docker)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Ciousten---Video-Insights---Reports
```

### 2. Configure Environment

Copy the example environment file and add your OpenRouter API key:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your API key:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. (Optional) Download SAM2 Weights

For full segmentation capabilities, download SAM2 model weights:

```bash
# Download SAM2 tiny model (recommended for CPU)
cd backend/sam_models
wget https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_tiny.pt

# Also download the config file
wget https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/sam2_configs/sam2_hiera_t.yaml
```

**Note**: Without SAM2 weights, the system will use bounding boxes only (YOLO detection).

### 4. Launch with Docker

```bash
# From the project root
docker-compose up --build
```

This will:
- Build and start the backend on `http://localhost:8000`
- Build and start the frontend on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔧 Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your OpenRouter API key

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000` and will proxy API requests to `http://localhost:8000`.

---

## 📖 Usage Workflow

### 1. Upload & Segment

1. Navigate to **Annotate** page
2. Upload a video file (.mp4, .mov, .avi)
3. Click **Start Segmentation**
4. Wait for processing (2-5 minutes for a 30-second video)
5. View segmentation statistics

### 2. AI Analysis

1. Navigate to **Analyze** page
2. Select your segmented project
3. Choose analysis type (traffic, retail, sports, etc.)
4. Select AI model (DeepSeek Free, Llama 3.1, etc.)
5. Click **Run AI Analysis**
6. Review insights, findings, and anomalies

### 3. Generate Reports

1. Navigate to **Reports** page
2. Find your analyzed project
3. Click **Generate Reports**
4. Download Excel and PDF reports

---

## 📁 Project Structure

```
Ciousten---Video-Insights---Reports/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── core/            # AI engines & reporting
│   │   ├── utils/           # Utilities
│   │   ├── config.py        # Configuration
│   │   ├── db.py            # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── main.py          # FastAPI app
│   ├── data/                # Uploaded videos & frames
│   ├── reports/             # Generated reports
│   ├── sam_models/          # SAM2 model weights
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── annotate/        # Upload & segmentation
│   │   ├── analyze/         # AI analysis
│   │   ├── reports/         # Download reports
│   │   ├── layout.tsx
│   │   └── page.tsx         # Home page
│   ├── components/ui/       # shadcn/ui components
│   ├── lib/                 # Utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔑 OpenRouter API Setup

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Navigate to **API Keys** in your dashboard
3. Create a new API key
4. Copy the key and add it to `backend/.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

### Recommended Models

- **DeepSeek Chat (Free)** - `deepseek/deepseek-chat-free` - Good for general analysis
- **Llama 3.1 8B (Free)** - `meta-llama/llama-3.1-8b-instruct:free` - Fast and capable
- **Gemini Flash 1.5** - `google/gemini-flash-1.5` - High quality (paid)

---

## ⚙️ Configuration

### Backend Configuration (`backend/.env`)

```env
# OpenRouter API
OPENROUTER_API_KEY=your_key_here
OPENROUTER_DEFAULT_MODEL=deepseek/deepseek-chat-free

# SAM2 Configuration
SAM2_CHECKPOINT=sam2_hiera_tiny.pt
SAM2_MODEL_CFG=sam2_hiera_t.yaml
SAM2_DEVICE=cpu

# YOLO Configuration
YOLO_MODEL=yolov8n.pt
YOLO_CONFIDENCE=0.25

# Video Processing
FRAME_EXTRACTION_FPS=2
MAX_VIDEO_SIZE_MB=500
```

### Performance Tuning

For CPU-only systems (Ryzen 5, 8-16GB RAM):
- Use `FRAME_EXTRACTION_FPS=2` (or lower for faster processing)
- Use SAM2 tiny model (`sam2_hiera_tiny.pt`)
- Process shorter videos (< 1 minute recommended)

---

## 📊 Sample Reports

### Excel Report Contents

- **Overview** - Project summary, statistics, class distribution chart
- **Frames** - Per-frame object counts with timeline chart
- **Objects** - Detailed object list with bounding boxes
- **AI_Insights** - Analysis results, findings, KPIs, dataset plan

### PDF Report Contents

- **Title Page** - Project information and branding
- **Executive Summary** - Statistics and class distribution
- **AI Analysis** - Summary, findings, anomalies, KPIs
- **Dataset Plan** - Recommended classes and splits

---

## 🐛 Troubleshooting

### SAM2 Not Working

If you see "SAM2 not available - using bounding box mode":
1. Ensure SAM2 weights are downloaded to `backend/sam_models/`
2. Check file names match configuration in `.env`
3. Install SAM2: `pip install git+https://github.com/facebookresearch/segment-anything-2.git`

### Slow Processing

For faster processing on CPU:
- Reduce `FRAME_EXTRACTION_FPS` to 1
- Use shorter videos
- Skip SAM2 and use YOLO bounding boxes only

### API Errors

- Verify OpenRouter API key is correct
- Check API quota/credits at openrouter.ai
- Try a different model if one fails

---

## 🤝 Contributing

This is an open-source project! Contributions are welcome.

---

## 📝 License

MIT License - feel free to use this project for any purpose.

---

## 👨‍💻 Author

**Aditya Shenvi**  
Website: [www.adityacuz.dev](https://www.adityacuz.dev)  
Year: 2025

---

## 🙏 Acknowledgments

- **Meta AI** - SAM2 model
- **Ultralytics** - YOLO implementation
- **OpenRouter** - LLM API platform
- **Vercel** - Next.js framework

---

**Happy Analyzing! 🎥✨**
