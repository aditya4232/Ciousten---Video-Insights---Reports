"""
OpenRouter API client for LLM-based video analysis.
"""

import httpx
import json
from typing import Dict, Any, Optional
from app.config import settings


class OpenRouterClient:
    """Client for OpenRouter API."""
    
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": settings.openrouter_site_url,
            "X-Title": settings.openrouter_app_name,
            "Content-Type": "application/json"
        }
    
    async def call_openrouter(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """
        Call OpenRouter API for chat completion.
        
        Args:
            model: Model identifier (e.g., "deepseek/deepseek-chat-free")
            system_prompt: System message
            user_prompt: User message
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
        
        Returns:
            Parsed JSON response from the model
        """
        endpoint = f"{self.base_url}/chat/completions"
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    endpoint,
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                
                # Extract content from response
                content = result["choices"][0]["message"]["content"]
                
                # Try to parse as JSON
                try:
                    # Remove markdown code blocks if present
                    if content.startswith("```json"):
                        content = content.split("```json")[1].split("```")[0].strip()
                    elif content.startswith("```"):
                        content = content.split("```")[1].split("```")[0].strip()
                    
                    parsed_json = json.loads(content)
                    return parsed_json
                
                except json.JSONDecodeError as e:
                    # If JSON parsing fails, return raw content
                    return {
                        "error": "Failed to parse JSON response",
                        "raw_content": content,
                        "parse_error": str(e)
                    }
            
            except httpx.HTTPStatusError as e:
                raise RuntimeError(f"OpenRouter API error: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                raise RuntimeError(f"OpenRouter API call failed: {str(e)}")
    
    async def analyze_video_metadata(
        self,
        metadata: Dict[str, Any],
        analysis_type: str = "generic",
        model: str = None
    ) -> Dict[str, Any]:
        """
        Analyze video segmentation metadata using OpenRouter.
        
        Args:
            metadata: Segmentation metadata (frames, objects, counts)
            analysis_type: Type of analysis (traffic, retail, sports, etc.)
            model: Model to use (uses default if None)
        
        Returns:
            Structured analysis result
        """
        model = model or settings.openrouter_default_model
        
        # Create system prompt
        system_prompt = """You are an expert AI video analytics assistant. You analyze video segmentation data and provide structured insights.

You MUST respond ONLY with valid JSON following this exact schema:

{
  "summary": "Brief overview of the video content and key observations",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "anomalies": ["Anomaly 1", "Anomaly 2"],
  "dataset_plan": {
    "classes": [
      {"name": "class_name", "min_samples": 100, "notes": "Notes about this class"}
    ],
    "recommended_split": {"train": 0.7, "val": 0.15, "test": 0.15}
  },
  "kpis": [
    {"name": "KPI Name", "value": 123.45, "unit": "unit"}
  ]
}

Ensure your response is valid JSON only, no additional text."""
        
        # Create user prompt with metadata
        user_prompt = f"""Analyze this video segmentation data for a {analysis_type} scenario:

Total Frames: {metadata.get('total_frames', 0)}
Total Objects Detected: {metadata.get('total_objects', 0)}
Average Objects per Frame: {metadata.get('avg_objects_per_frame', 0):.2f}

Objects by Class:
{json.dumps(metadata.get('objects_per_class', {}), indent=2)}

Sample Frame Data (first 5 frames):
{json.dumps(metadata.get('sample_frames', [])[:5], indent=2)}

Provide a comprehensive analysis with actionable insights, potential anomalies, and recommendations for building a dataset from this video."""
        
        # Call OpenRouter
        result = await self.call_openrouter(
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.7
        )
        
        return result


# Global instance
openrouter_client = OpenRouterClient()
