export type RegisterVideoRequestResponse = {
    data: string;
    message: string;
}

export type PollVideoStatusResponse = {
    status: string;
    message?: string;
}

export type FetchMetaDataResponse = {
    data: Record<string, any>
}