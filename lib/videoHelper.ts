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
    url1080: string
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
  poster: {
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
  let transcodedVideo: {
    low: TaskData['transcodingResults'][0]['statuses'][string]['videos'][0]
    high: TaskData['transcodingResults'][0]['statuses'][string]['videos'][0]
  } | null = null
  let thumbnail:
    | TaskData['transcodingResults'][0]['statuses'][string]['images'][0]
    | null = null
  let poster:
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
      transcodedVideo = {
        low: completedStatus.videos[0],
        high: completedStatus.videos[1],
      }

      if (completedStatus.images && completedStatus.images.length > 0) {
        thumbnail = completedStatus.images[1]
        poster = completedStatus.images[0]
      }
    }
  }

  // Prefer transcoded video if available, otherwise fall back to original
  const url540 = transcodedVideo?.low?.url || originalVideoSrc
  const url1080 = transcodedVideo?.high?.url || originalVideoSrc
  const videoSrc = originalVideoSrc.startsWith('//')
    ? `https:${originalVideoSrc}`
    : originalVideoSrc

  return {
    video: {
      url: url540,
      url1080: url1080,
      src: videoSrc,
      bitrate: transcodedVideo?.low?.bitrate,
      width: transcodedVideo?.low.meta.width,
      height: transcodedVideo?.low.meta.height,
      duration: transcodedVideo?.low.duration,
    },
    poster: poster
      ? {
          url: poster.url,
          width: poster.meta.width,
          height: poster.meta.height,
        }
      : null,
    thumbnail: thumbnail
      ? {
          url: thumbnail.url,
          width: thumbnail.meta.width,
          height: thumbnail.meta.height,
        }
      : null,
  }
}
