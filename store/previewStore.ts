// Simple in-memory store for preview data passed between createPost and postPreview screens
let _previewData: PreviewData | null = null;
let _shouldResetCreatePostAfterPreviewSuccess = false;

export interface PreviewData {
  activeTab: string;
  postType: string;
  currentMedia: string | string[] | null;
  caption: string;
  activeTags: string[];
  selectedPlatforms: Record<string, boolean>;
  date: Date | null;
  thumbNailOffset?: number;
  instagramUsername?: string;
}

export function setPreviewData(data: PreviewData) {
  _previewData = data;
}

export function getPreviewData(): PreviewData | null {
  return _previewData;
}

export function clearPreviewData() {
  _previewData = null;
}

export function markPreviewPostSuccessReset() {
  _shouldResetCreatePostAfterPreviewSuccess = true;
}

export function consumePreviewPostSuccessReset(): boolean {
  const shouldReset = _shouldResetCreatePostAfterPreviewSuccess;
  _shouldResetCreatePostAfterPreviewSuccess = false;
  return shouldReset;
}
