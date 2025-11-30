/**
 * Centralized API client for Ciousten frontend
 * Handles all API calls with proper error handling and TypeScript types
 */

// API Response Types
export interface Project {
    project_id: string;
    video_filename: string;
    status: 'uploading' | 'uploaded' | 'processing' | 'segmented' | 'analyzed' | 'completed' | 'failed';
    created_at: string;
    has_segmentation: boolean;
    has_analysis: boolean;
    has_reports: boolean;
    annotated_video_path?: string;
}

export interface SegmentationStats {
    total_frames: number;
    total_objects: number;
    avg_objects_per_frame: number;
    processing_time_seconds: number;
    objects_per_class: Record<string, number>;
}

export interface Anomaly {
    frame_index: number;
    timestamp: number;
    description: string;
    severity: number;
}

export interface Activity {
    start_frame: number;
    end_frame: number;
    label: string;
    confidence: number;
}

export interface DatasetCard {
    title: string;
    description: string;
    intended_use: string;
    labels: string[];
    collection_process: string;
    risks: string;
    limitations: string;
    ethical_considerations: string;
}

export interface Analysis {
    summary: string;
    key_findings: string[];
    anomalies?: string[];
    anomaly_events?: Anomaly[];
    activities?: Activity[];
    mode?: string;
    kpis?: Array<{
        name: string;
        value: number;
        unit: string;
    }>;
}

export interface ApiError {
    message: string;
    status: number;
}

// API Client Class
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const error: ApiError = {
                    message: `API Error: ${response.statusText}`,
                    status: response.status,
                };
                throw error;
            }

            return await response.json();
        } catch (error: any) {
            if (error.status) {
                throw error;
            }
            throw {
                message: error.message || 'Network error occurred',
                status: 0,
            } as ApiError;
        }
    }

    // Project APIs
    async getProjects(): Promise<Project[]> {
        return this.request<Project[]>('/projects');
    }

    async getProject(projectId: string): Promise<Project> {
        return this.request<Project>(`/projects/${projectId}`);
    }

    // Upload APIs
    async uploadVideo(file: File): Promise<{ project_id: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/upload-video`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw {
                message: 'Upload failed',
                status: response.status,
            } as ApiError;
        }

        return response.json();
    }

    async createSampleProject(): Promise<{ project_id: string }> {
        const response = await fetch(`${this.baseUrl}/sample`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Failed to create sample project");
        }

        return response.json();
    }
    async startSegmentation(projectId: string): Promise<void> {
        await this.request(`/segment-video/${projectId}`, {
            method: 'POST',
        });
    }

    async getSegmentationStatus(projectId: string): Promise<{
        status: string;
        stats?: SegmentationStats;
        progress?: number;
        status_message?: string;
    }> {
        return this.request(`/segment-video/${projectId}/status`);
    }

    // Analysis APIs
    async analyzeVideo(
        projectId: string,
        analysisType: string,
        model: string,
        mode: string = "generic"
    ): Promise<{ analysis: Analysis }> {
        return this.request(`/analyze/${projectId}`, {
            method: 'POST',
            body: JSON.stringify({ analysis_type: analysisType, model, mode }),
        });
    }

    // Report APIs
    async generateReports(projectId: string): Promise<void> {
        await this.request(`/reports/${projectId}/generate`, {
            method: 'POST',
        });
    }

    async generateDatasetCard(projectId: string): Promise<DatasetCard> {
        return this.request<DatasetCard>(`/projects/${projectId}/dataset-card`, {
            method: 'POST',
        });
    }



    async downloadReport(
        projectId: string,
        type: 'excel' | 'pdf'
    ): Promise<Blob> {
        const response = await fetch(
            `${this.baseUrl}/reports/${projectId}/download/${type}`
        );

        if (!response.ok) {
            throw {
                message: 'Download failed',
                status: response.status,
            } as ApiError;
        }

        return response.blob();
    }

    // Health Check
    async healthCheck(): Promise<{ status: string }> {
        return this.request('/health');
    }
}

// Export singleton instance
export const api = new ApiClient();

// Utility function to handle API errors
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return (error as ApiError).message;
    }
    return 'An unexpected error occurred';
}
