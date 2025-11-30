import os
import sys
import subprocess
import urllib.request
from pathlib import Path

# Configuration
SAM_MODELS_DIR = Path("sam_models")
SAM2_REPO_URL = "git+https://github.com/facebookresearch/segment-anything-2.git"

# Checkpoints to download (using Tiny for speed/CPU, but can add others)
CHECKPOINTS = {
    "sam2_hiera_tiny.pt": "https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_tiny.pt",
    # "sam2_hiera_small.pt": "https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_small.pt",
}

# Configs to download
CONFIGS = {
    "sam2_hiera_t.yaml": "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/sam2_configs/sam2_hiera_t.yaml",
    # "sam2_hiera_s.yaml": "https://raw.githubusercontent.com/facebookresearch/segment-anything-2/main/sam2_configs/sam2_hiera_s.yaml",
}

def install_sam2():
    print("Installing SAM2 from GitHub...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", SAM2_REPO_URL])
        print("✓ SAM2 installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install SAM2: {e}")
        sys.exit(1)

def download_file(url, path):
    print(f"Downloading {path.name}...")
    try:
        urllib.request.urlretrieve(url, path)
        print(f"✓ Downloaded {path.name}")
    except Exception as e:
        print(f"✗ Failed to download {path.name}: {e}")

def setup():
    # 1. Install SAM2
    try:
        import sam2
        print("✓ SAM2 is already installed.")
    except ImportError:
        install_sam2()

    # 2. Create models directory
    SAM_MODELS_DIR.mkdir(exist_ok=True)

    # 3. Download Checkpoints
    for filename, url in CHECKPOINTS.items():
        path = SAM_MODELS_DIR / filename
        if not path.exists():
            download_file(url, path)
        else:
            print(f"✓ {filename} already exists.")

    # 4. Download Configs
    for filename, url in CONFIGS.items():
        path = SAM_MODELS_DIR / filename
        if not path.exists():
            download_file(url, path)
        else:
            print(f"✓ {filename} already exists.")

    print("\nSAM2 Setup Complete!")
    print(f"Models directory: {SAM_MODELS_DIR.absolute()}")

if __name__ == "__main__":
    setup()
