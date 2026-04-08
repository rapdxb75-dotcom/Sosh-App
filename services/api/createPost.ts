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
        formData.append("scheduleDate", formatDateWithOffset(scheduleDate));
        formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
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
        formData.append("scheduleDate", formatDateWithOffset(scheduleDate));
        formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
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
   * @param scheduleDate Optional publish schedule date
   * @returns Promise with API response
   */
  createStory: async (
    email: string,
    selectedPlatforms: string[],
    publishNow: boolean,
    mediaPayload: any,
    scheduleDate: Date | null,
  ) => {
    try {
      const token = await storageService.getToken();

      const formData = new FormData();
      if (email) {
        formData.append("email", email);
      }
      formData.append("publishnow", String(publishNow));

      // Schedule date
      if (!publishNow && scheduleDate) {
        formData.append("scheduleDate", formatDateWithOffset(scheduleDate));
        formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
      }

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
   * @param publishNow Boolean to publish immediately
   * @param mediaPayloads Array of binary media payloads
   * @param scheduleDate Optional publish schedule date
   * @returns Promise with API response
   */
  createCarousel: async (
    captionPrompt: string,
    tags: string[],
    selectedPlatforms: string[],
    publishNow: boolean,
    mediaPayloads: any[],
    scheduleDate: Date | null,
  ) => {
    try {
      const token = await storageService.getToken();

      const formData = new FormData();

      formData.append("captionPromt", captionPrompt);
      formData.append("max_tokens", "1024");
      formData.append("publishnow", String(publishNow));

      // Schedule date
      if (!publishNow && scheduleDate) {
        formData.append("scheduleDate", formatDateWithOffset(scheduleDate));
        formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
      }

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

      // Log the payload being sent
      console.log("🚀 Creating Carousel Payload:");
      (formData as any)._parts?.forEach((part: any) => {
        // Truncate base64 strings or large files for cleaner logging
        const key = part[0];
        const value = part[1];
        if (typeof value === "string" && value.length > 100) {
          console.log(
            `  ${key}: [File/Base64 data truncated, length: ${value.length}]`,
          );
        } else {
          console.log(`  ${key}:`, value);
        }
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

/**
 * Helper to format date in ISO 8601 with local timezone offset
 */
const formatDateWithOffset = (date: Date): string => {
  const offset = -date.getTimezoneOffset();
  const diff = offset >= 0 ? "+" : "-";
  const pad = (num: number) => (num < 10 ? "0" : "") + num;

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${diff}${offsetHours}:${offsetMinutes}`;
};

export default createPostService;
