"""
Plugin Registry
Allows extending Ciousten with custom Python modules.
"""

import importlib
import pkgutil
import os
from typing import List, Dict, Any
from app.schemas import PluginStatus, PluginResult

# Directory where plugins are stored
PLUGIN_DIR = os.path.join(os.path.dirname(__file__), "modules")

class PluginRegistry:
    def __init__(self):
        self.plugins = {}
        self._discover_plugins()

    def _discover_plugins(self):
        """Discover plugins in the plugins directory."""
        # Ensure directory exists
        if not os.path.exists(PLUGIN_DIR):
            os.makedirs(PLUGIN_DIR)

        # Walk through modules
        for _, name, _ in pkgutil.iter_modules([PLUGIN_DIR]):
            try:
                module = importlib.import_module(f"app.core.plugins.modules.{name}")
                if hasattr(module, "run_plugin") and hasattr(module, "PLUGIN_NAME"):
                    self.plugins[name] = module
                    print(f"✓ Loaded plugin: {module.PLUGIN_NAME}")
            except Exception as e:
                print(f"⚠ Failed to load plugin {name}: {e}")

    def get_plugins(self) -> List[PluginStatus]:
        """Get list of available plugins."""
        return [
            PluginStatus(
                name=module.PLUGIN_NAME,
                enabled=True,
                version=getattr(module, "PLUGIN_VERSION", "1.0.0")
            )
            for name, module in self.plugins.items()
        ]

    def run_all_plugins(self, project_id: str, segmentation_data: Dict, analysis_data: Dict) -> List[PluginResult]:
        """Run all enabled plugins."""
        results = []
        for name, module in self.plugins.items():
            try:
                print(f"Running plugin: {module.PLUGIN_NAME}...")
                data = module.run_plugin(project_id, segmentation_data, analysis_data)
                results.append(PluginResult(
                    plugin_name=module.PLUGIN_NAME,
                    data=data
                ))
            except Exception as e:
                print(f"Error running plugin {name}: {e}")
                results.append(PluginResult(
                    plugin_name=module.PLUGIN_NAME,
                    data={"error": str(e)}
                ))
        return results

# Global instance
registry = PluginRegistry()
