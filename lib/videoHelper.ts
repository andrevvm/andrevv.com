export interface TaskData {
  transcodingStarted: boolean
  transcodingJobs: Array<{
    taskToken: string
    statusUrl: string
    templateName: string
  }>
  videoSrc: string
  transcodingResults: Array<{
    error: number
    statuses: {
      [taskToken: string]: {
        status: string
        percent: number
        error: number
        error_description: string | null
        warnings: unknown[]
        images: Array<{
          tag: string
          url: string
          download_url: string
          meta: {
            width: number
            height: number
            format: string
            time: number
            time_fraction: number
          }
          output_format: string
        }>
        videos: Array<{
          tag: string
          url: string
          download_url: string
          bitrate: number
          video_codec: string
          meta: {
            resolution_width: number
            resolution_height: number
            width: number
            height: number
            framerate: string
            codec: string
          }
          duration: string
          size: string
          output_format: string
        }>
      }
    }
  }>
  transcodingFinished: boolean
}

export interface VideoThumbnailResult {
  video: {
    url: string
    src: string
    bitrate?: number
    width?: number
    height?: number
    duration?: string
  }
  thumbnail: {
    url: string
    width: number
    height: number
  } | null
}

/**
 * Extracts video and thumbnail objects from taskData structure
 * @param taskData - The taskData object from Contentful
 * @returns Object containing video URL and thumbnail URL, or null if data is invalid
 */
export function getVideoAndThumbnail(
  taskData: TaskData | null | undefined,
): VideoThumbnailResult | null {
  if (!taskData) {
    return null
  }

  // Get the original video source
  const originalVideoSrc = taskData.videoSrc

  // Extract transcoded videos and thumbnails from the first completed transcoding result
  let transcodedVideo:
    | TaskData['transcodingResults'][0]['statuses'][string]['videos'][0]
    | null = null
  let thumbnail:
    | TaskData['transcodingResults'][0]['statuses'][string]['images'][0]
    | null = null

  if (
    taskData.transcodingResults &&
    taskData.transcodingResults.length > 0 &&
    taskData.transcodingResults[0].statuses
  ) {
    const statuses = taskData.transcodingResults[0].statuses

    // Find the first completed status
    const completedStatus = Object.values(statuses).find(
      (status) =>
        status.status === 'completed' &&
        status.videos &&
        status.videos.length > 0,
    )

    if (completedStatus) {
      // Get the highest quality video (highest bitrate)
      transcodedVideo = completedStatus.videos.reduce((prev, current) => {
        return (current.bitrate || 0) > (prev.bitrate || 0) ? current : prev
      }, completedStatus.videos[0])

      if (completedStatus.images && completedStatus.images.length > 0) {
        thumbnail = completedStatus.images[1]
      }
    }
  }

  // Prefer transcoded video if available, otherwise fall back to original
  const videoUrl = transcodedVideo?.url || originalVideoSrc
  const videoSrc = originalVideoSrc.startsWith('//')
    ? `https:${originalVideoSrc}`
    : originalVideoSrc

  return {
    video: {
      url: videoUrl,
      src: videoSrc,
      bitrate: transcodedVideo?.bitrate,
      width: transcodedVideo?.meta.width,
      height: transcodedVideo?.meta.height,
      duration: transcodedVideo?.duration,
    },
    thumbnail: thumbnail
      ? {
          url: thumbnail.url,
          width: thumbnail.meta.width,
          height: thumbnail.meta.height,
        }
      : null,
  }
}
