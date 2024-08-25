const { freeze } = Object;

export const REQUEST_STATES = {
    REGISTERING_REQUEST: "registering request",
    PROCESSING: "processing",
    FETCHING_DETAILS: "fetching details",
    AWAITING_FORMAT: "awaiting format",
    REGISTERING_FORMAT: "registering format",
    DOWNLOADING: "downloading",
    FINISHED: "finished"
} as const