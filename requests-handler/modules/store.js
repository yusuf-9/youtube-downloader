const { v4 } = require('uuid')

class Store {
    constructor() {
        this.store = {};
    }

    addVideoRequest(videoURL) {
        const uniqueId = v4();
        this.store[uniqueId] = {
            videoURL,
            status: 'pending', // can be pending, awaiting_format, downloading, finished or failed
            downloadURL: '',
            metaData: null,
            error: null
        };
        return uniqueId;
    }

    updateRequestStatus(videoId, status) {
        if (!videoId || !this.store[videoId]) return;

        this.store[videoId] = {
            ...this.store[videoId],
            status: status,
        };
    }

    updateVideoMetaData(videoId, metaData) {
        if (!videoId || !metaData || !this.store[videoId]) return;

        this.store[videoId] = {
            ...this.store[videoId],
            status: 'awaiting_format',
            metaData: metaData
        };
    }

    updateDownloadURL(videoId, downloadURL) {
        if (!videoId || !downloadURL || !this.store[videoId]) return;

        this.store[videoId] = {
            ...this.store[videoId],
            status: 'finished',
            downloadURL: downloadURL
        };
    }

    markVideoRequestAsFailed(videoId, error = "Something went wrong"){
        if (!videoId || !this.store[videoId]) return;

        this.store[videoId] = {
            ...this.store[videoId],
            status: 'failed',
            error: error
        };
    }
}

module.exports = Store;