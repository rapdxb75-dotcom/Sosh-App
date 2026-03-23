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
    mediaPayload: any | any[],
    scheduleDate: Date | null,
  ) => {
    try {
      const token = await storageService.getToken();

      const formData = new FormData();

      formData.append("captionPromt", captionPrompt);
      tags.forEach((tag) => {
        const formattedTag = tag.startsWith("@") ? tag : `@${tag}`;
        formData.append("tags", formattedTag);
      });
      if (tags.length === 1) {
        formData.append("tags", "");
      }
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
      if (Array.isArray(mediaPayload)) {
        mediaPayload.forEach((media) => {
          formData.append("mediaUrl", media);
        });
      } else {
        formData.append("mediaUrl", mediaPayload);
      }

      const response = await apiClient.post<CreatePostResponse>(
        "/create-post",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Create Post API Error:", error);
      throw error;
    }
  },

  /**
   * Create a reel via webhook
   * @param captionPrompt Post caption
   * @param tags Array of tags
   * @param selectedPlatforms Array of platform names
   * @param publishNow Boolean to publish immediately
   * @param mediaPayload Base64 string of the video
   * @param scheduleDate Optional publish schedule date
   * @param thumbNailOffset Offset in milliseconds for the thumbnail
   * @param thumbnailPayload Optional thumbnail payload
   * @returns Promise with API response
   */
  createReel: async (
    captionPrompt: string,
    tags: string[],
    selectedPlatforms: string[],
    publishNow: boolean,
    mediaPayload: any,
    scheduleDate: Date | null,
    thumbNailOffset: number,
    thumbnailPayload?: any,
  ) => {
    try {
      const token = await storageService.getToken();

      const formData = new FormData();

      formData.append("captionPromt", captionPrompt);
      tags.forEach((tag) => {
        const formattedTag = tag.startsWith("@") ? tag : `@${tag}`;
        formData.append("tags", formattedTag);
      });
      if (tags.length === 1) {
        formData.append("tags", "");
      }
      formData.append("publishnow", String(publishNow));
      formData.append("isReel", "true");
      formData.append("max_tokens", "1024");

      // Send timestamp in milliseconds
      if (thumbNailOffset > 0) {
        formData.append("thumbNailOffset", String(Math.floor(thumbNailOffset)));
      }

      // Send thumbnail payload if provided
      if (thumbnailPayload) {
        formData.append("thumbNail", thumbnailPayload);
      }

      // Append platforms
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

      // Media
      formData.append("mediaUrl", mediaPayload);

      const response = await apiClient.post<CreatePostResponse>(
        "/create-reels",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Create Reel API Error:", error);
      throw error;
    }
  },

  /**
   * Create a story via webhook
   * @param email User email
   * @param selectedPlatforms Array of platform names
   * @param publishNow Boolean to publish immediately
   * @param mediaPayload Binary or Base64 string of the media
   * @returns Promise with API response
   */
  createStory: async (
    email: string,
    selectedPlatforms: string[],
    publishNow: boolean,
    mediaPayload: any,
  ) => {
    try {
      const token = await storageService.getToken();

      const formData = new FormData();
      if (email) {
        formData.append("email", email);
      }
      formData.append("publishnow", String(publishNow));

      // Append platforms
      selectedPlatforms.forEach((platform) => {
        formData.append("platforms", platform);
      });

      if (selectedPlatforms.length === 1) {
        formData.append("platforms", "");
      }

      formData.append("mediaUrl", mediaPayload);

      const response = await apiClient.post<CreatePostResponse>(
        "/create-story",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Create Story API Error:", error);
      throw error;
    }
  },

  /**
   * Create a carousel post via webhook
   * @param captionPrompt Post caption
   * @param tags Array of tags
   * @param selectedPlatforms Array of platform names
   * @param mediaPayloads Array of binary media payloads
   * @returns Promise with API response
   */
  createCarousel: async (
    captionPrompt: string,
    tags: string[],
    selectedPlatforms: string[],
    mediaPayloads: any[],
  ) => {
    try {
      const token = await storageService.getToken();

      const formData = new FormData();

      formData.append("captionPromt", captionPrompt);
      formData.append("max_tokens", "1024");
      tags.forEach((tag) => {
        const formattedTag = tag.startsWith("@") ? tag : `@${tag}`;
        formData.append("userTags", formattedTag);
      });
      if (tags.length === 1) {
        formData.append("userTags", "");
      }

      // Append platforms with capital P as per API spec
      selectedPlatforms.forEach((platform) => {
        formData.append("Platforms", platform);
      });

      if (selectedPlatforms.length === 1) {
        formData.append("Platforms", "");
      }

      // Append multiple media files
      mediaPayloads.forEach((media) => {
        formData.append("mediaUrl", media);
      });

      const response = await apiClient.post<CreatePostResponse>(
        "/create-carousels",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Create Carousel API Error:", error);
      throw error;
    }
  },
};

export default createPostService;
