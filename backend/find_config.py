import sam2
import os
from pathlib import Path
import shutil

# Find where sam2 is installed
package_dir = Path(sam2.__file__).parent
print(f"SAM2 installed at: {package_dir}")

# Look for configs
config_dir = package_dir / "configs"
if not config_dir.exists():
    # Try one level up (if installed in src)
    config_dir = package_dir.parent / "sam2_configs"

print(f"Looking for configs in: {config_dir}")

target_config = "sam2_hiera_t.yaml"
found_config = None

# Search recursively
for path in config_dir.rglob(target_config):
    found_config = path
    break

if found_config:
    print(f"Found config at: {found_config}")
    # Copy to sam_models
    dest = Path("sam_models") / target_config
    shutil.copy(found_config, dest)
    print(f"Copied to {dest}")
else:
    print("Config not found!")
    # List what we found
    print("Available configs:")
    for path in config_dir.rglob("*.yaml"):
        print(path.name)
