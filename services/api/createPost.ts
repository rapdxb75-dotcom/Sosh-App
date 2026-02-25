import storageService from "../storage";
import apiClient from "./client";

export interface CreatePostResponse {
    success?: boolean;
    message?: string;
    data?: any;
}

export interface CreatePostPayload {
    captionPromt: string;
    tags: string;
    platforms?: string[];
    publishnow: boolean;
    isCarousel: boolean;
    scheduleDate?: string;
    max_tokens: string;
    mediaUrl: string | string[];
}

const createPostService = {
    /**
     * Create a post via webhook
     * @param captionPrompt Post caption
     * @param tags Array of tags
     * @param selectedPlatforms Array of platform names
     * @param publishNow Boolean to publish immediately
     * @param isCarousel Boolean indicating if media is a carousel
     * @param mediaBase64 Base64 string or array of base64 strings
     * @param scheduleDate Optional publish schedule date
     * @returns Promise with API response
     */
    createPost: async (
        captionPrompt: string,
        tags: string[],
        selectedPlatforms: string[],
        publishNow: boolean,
        isCarousel: boolean,
        mediaBase64: string | string[],
        scheduleDate: Date | null
    ) => {
        try {
            const token = await storageService.getToken();

            const formData = new FormData();

            formData.append("captionPromt", captionPrompt);
            formData.append("tags", tags.join(","));
            formData.append("publishnow", String(publishNow));
            formData.append("isCarousel", String(isCarousel));
            formData.append("max_tokens", "1024");

            // ✅ Append platforms like your example
            selectedPlatforms.forEach((platform) => {
                formData.append("platforms", platform);
            });

            // If there's only 1 platform, append an empty string to ensure FormData sends it as an array
            if (selectedPlatforms.length === 1) {
                formData.append("platforms", "");
            }

            // Schedule date
            if (!publishNow && scheduleDate) {
                formData.append("scheduleDate", scheduleDate.toISOString());
            }

            // Media (single or carousel)
            if (Array.isArray(mediaBase64)) {
                mediaBase64.forEach((media) => {
                    formData.append("mediaUrl", media);
                });
            } else {
                formData.append("mediaUrl", mediaBase64);
            }

            const response = await apiClient.post<CreatePostResponse>(
                "/create-post",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Create Post API Error:", error);
            throw error;
        }
    }
};

export default createPostService;
