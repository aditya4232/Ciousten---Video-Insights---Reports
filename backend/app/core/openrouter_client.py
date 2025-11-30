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
        
        retries = 3
        backoff = 2
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(retries):
                try:
                    response = await client.post(
                        endpoint,
                        headers=self.headers,
                        json=payload
                    )
                    
                    if response.status_code == 429:
                        if attempt < retries - 1:
                            import asyncio
                            wait_time = backoff * (attempt + 1)
                            print(f"⚠ OpenRouter 429 Rate Limit. Retrying in {wait_time}s...")
                            await asyncio.sleep(wait_time)
                            continue
                    
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
                    if e.response.status_code == 429 and attempt < retries - 1:
                         # This block might be redundant due to the explicit check above, but good for safety
                         import asyncio
                         wait_time = backoff * (attempt + 1)
                         print(f"⚠ OpenRouter 429 Rate Limit (caught). Retrying in {wait_time}s...")
                         await asyncio.sleep(wait_time)
                         continue
                    raise RuntimeError(f"OpenRouter API error: {e.response.status_code} - {e.response.text}")
                except Exception as e:
                    raise RuntimeError(f"OpenRouter API call failed: {str(e)}")
            
            raise RuntimeError("OpenRouter API failed after retries")
    
    async def analyze_video_metadata(
        self,
        metadata: Dict[str, Any],
        analysis_type: str = "generic",
        model: str = None,
        mode: str = "generic"
    ) -> Dict[str, Any]:
        """
        Analyze video segmentation metadata using OpenRouter.
        
        Args:
            metadata: Segmentation metadata (frames, objects, counts)
            analysis_type: Type of analysis (traffic, retail, sports, etc.)
            model: Model to use (uses default if None)
            mode: Domain mode (traffic, retail, security, generic)
        
        Returns:
            Structured analysis result
        """
        model = model or settings.openrouter_default_model
        
        # Mode-specific context
        mode_context = ""
        if mode == "traffic":
            mode_context = "Focus on vehicle counts, congestion levels, traffic flow, and safety risks."
        elif mode == "retail":
            mode_context = "Focus on customer behavior, dwell times, queue lengths, and store layout efficiency."
        elif mode == "security":
            mode_context = "Focus on suspicious activities, unauthorized access, crowd density, and potential threats."
        
        # Create system prompt
        system_prompt = f"""You are an expert AI video analytics assistant specialized in {mode} analysis. {mode_context}
You analyze video segmentation data and provide structured insights.

You MUST respond ONLY with valid JSON following this exact schema:

{{
  "summary": "Brief overview of the video content and key observations",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "anomalies": ["Anomaly 1", "Anomaly 2"],
  "dataset_plan": {{
    "classes": [
      {{"name": "class_name", "min_samples": 100, "notes": "Notes about this class"}}
    ],
    "recommended_split": {{"train": 0.7, "val": 0.15, "test": 0.15}}
  }},
  "kpis": [
    {{"name": "KPI Name", "value": 123.45, "unit": "unit"}}
  ]
}}

Ensure your response is valid JSON only, no additional text."""
        
        # Create user prompt with metadata
        user_prompt = f"""Analyze this video segmentation data for a {mode} scenario:

Total Frames: {metadata.get('total_frames', 0)}
Total Objects Detected: {metadata.get('total_objects', 0)}
Unique Objects Tracked: {metadata.get('unique_objects', 'N/A')}
Average Objects per Frame: {metadata.get('avg_objects_per_frame', 0):.2f}

Objects by Class:
{json.dumps(metadata.get('objects_per_class', {}), indent=2)}

Sample Frame Data (first 5 frames):
{json.dumps(metadata.get('sample_frames', [])[:5], indent=2)}

Provide a comprehensive analysis with actionable insights, potential anomalies, and recommendations for building a dataset from this video."""
        
        try:
            # Call OpenRouter
            result = await self.call_openrouter(
                model=model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7
            )
            return result
        except Exception as e:
            print(f"Analysis failed: {e}")
            return {
                "summary": "AI Analysis is currently unavailable due to high traffic or API limits. Please try again later.",
                "key_findings": ["Analysis service busy", "Please retry"],
                "anomalies": [],
                "dataset_plan": {
                    "recommended_classes": [],
                    "train_split": 0.0,
                    "val_split": 0.0,
                    "test_split": 0.0,
                    "notes": "Service unavailable"
                },
                "kpis": []
            }

    async def generate_dataset_card(
        self,
        project_summary: Dict[str, Any],
        analysis_summary: Dict[str, Any],
        model: str = None
    ) -> Dict[str, Any]:
        """
        Generate a dataset card using OpenRouter.
        """
        model = model or settings.openrouter_default_model
        
        system_prompt = """You are an expert data scientist. You generate professional Dataset Cards (README.md style) for video datasets.
        
You MUST respond ONLY with valid JSON following this exact schema:

{
  "title": "Dataset Title",
  "description": "Detailed description...",
  "intended_use": "Intended use cases...",
  "labels": ["Label 1", "Label 2"],
  "collection_process": "How data was collected...",
  "risks": "Potential risks...",
  "limitations": "Known limitations...",
  "ethical_considerations": "Ethical notes..."
}

Ensure your response is valid JSON only."""

        user_prompt = f"""Generate a Dataset Card for this video project:

Project Info:
{json.dumps(project_summary, indent=2)}

Analysis Insights:
{json.dumps(analysis_summary, indent=2)}

Create a comprehensive, professional dataset card suitable for Hugging Face or GitHub."""

        return await self.call_openrouter(
            model=model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.7
        )


# Global instance
openrouter_client = OpenRouterClient()
