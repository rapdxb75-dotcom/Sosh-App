import * as VideoThumbnails from "expo-video-thumbnails";

/**
 * Generates a thumbnail for a given video URI at a specific offset.
 *
 * @param videoUri The URI of the video file.
 * @param timeMs The offset in milliseconds where the thumbnail should be captured.
 * @param quality A value between 0 and 1, where 1 is the highest quality.
 * @returns A promise that resolves to the thumbnail URI or null if generation fails.
 */
export async function generateVideoThumbnail(
  videoUri: string,
  timeMs: number = 0,
  quality: number = 0.7,
): Promise<string | null> {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: quality,
    });
    return uri;
  } catch (e) {
    console.warn("Error generating video thumbnail:", e);
    return null;
  }
}
