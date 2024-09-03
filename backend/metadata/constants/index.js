const DEFAULT_RESOLUTION = "best quality"

const AUDIO_FORMAT_EXTENSIONS = [
    "mp3", "wav", "aac"
]

const VIDEO_FORMAT_EXTENSIONS = [
    "mp4", "webm", "mov", "wmv"
]

const DEFAULT_FORMATS_CONFIG = {
    video: {
        resolutions: [DEFAULT_RESOLUTION],
        extensions: VIDEO_FORMAT_EXTENSIONS,
    },
    audio: {
        resolutions: [DEFAULT_RESOLUTION, "320k", "192k", "128k"],
        extensions: AUDIO_FORMAT_EXTENSIONS,
    },
}


module.exports = {
    DEFAULT_RESOLUTION,
    DEFAULT_FORMATS_CONFIG,
    AUDIO_FORMAT_EXTENSIONS,
    VIDEO_FORMAT_EXTENSIONS,
}

