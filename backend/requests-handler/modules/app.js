const express = require('express');
const StringCodec = require('nats').StringCodec

class App {
    constructor(natsConnection, appStore) {
        this.app = express();

        this.appStore = appStore;

        this.natsConnection = natsConnection
        this.stringEncoder = StringCodec()
        this.videoMetaDataFetchedSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_METADATA_FETCHED)
        this.videoDownloadedSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_DOWNLOADED)
        this.videoDownloadErrorSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_FAILED)
    }

    configureServer() {
        this.app.use(express.json());

        this.app.post("/register-request", (req, res) => {
            const videoUrl = req.body?.url;
            if (!videoUrl) throw new Error("Video URL has not been provided")

            const videoRequestId = this.appStore.addVideoRequest(videoUrl)

            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_REQUEST_CREATED,
                JSON.stringify({ url: videoUrl, requestId: videoRequestId })
            );

            res.status(201).json({
                data: videoRequestId,
                message: 'Video request created'
            });
        })

        this.app.get("/:requestId/meta-data", (req, res) => {
            const requestId = req.params?.requestId;
            if (!requestId) throw new Error("Request ID has not been provided")

            const metaData = this.appStore.store[requestId]?.metaData;
            if (!metaData) throw new Error('Invalid request ID');

            res.status(200).json({
                data: metaData,
            });
        })

        this.app.post("/register-format", (req, res) => {
            const format = req.body?.format;
            const requestId = req?.body?.id;
            if (!format || !requestId) throw new Error("Format or request ID has not been provided")

            const videoRequest = this.appStore.store[requestId];
            if (!videoRequest) throw new Error('Invalid request ID');

            const videoId = videoRequest?.metaData?.id;
            const selectedFormat = Object.values(videoRequest?.metaData?.formats).find((formatData) => {
                return formatData?.resolutions?.includes(format?.resolution) && 
                    formatData?.extensions?.includes(format?.extension)
            })
            if (!selectedFormat) throw new Error('Invalid format');

            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED,
                JSON.stringify({ videoId, format, requestId })
            );

            this.appStore.updateRequestStatus(requestId, "downloading");

            res.status(200).json({
                data: null,
                message: 'Video download queued'
            });
        })

        this.app.get("/:requestId/status", (req, res) => {
            const requestId = req.params?.requestId;
            if (!requestId) throw new Error("Request ID has not been provided")

            const videoRequest = this.appStore.store[requestId];
            if (!videoRequest) throw new Error("Invalid request ID")

            res.status(200).json({
                status: videoRequest?.status,
                message: videoRequest?.error || '',
                ...(videoRequest?.downloadURL && { data: videoRequest.downloadURL })
            });
        })

        this.app.use((error, req, res, next) => {
            return res.status(400).json({ error: error?.message })
        })
    }

    registerSubscriptionHandlers() {
        this.registerVideoMetaDataFetchedSubscriptionHandler();
        this.registerVideoDownloadedSubscriptionHandler();
        this.registerVideoDownloadedErrorSubscriptionHandler();
    }

    async registerVideoMetaDataFetchedSubscriptionHandler() {
        for await (const event of this.videoMetaDataFetchedSubscription) {
            const decodedData = this.stringEncoder.decode(event.data)
            const parsedData = JSON.parse(decodedData)
            if (parsedData?.requestId && parsedData?.metaData) {
                this.appStore.updateVideoMetaData(
                    parsedData.requestId,
                    parsedData.metaData
                )
            }
        }
    }

    async registerVideoDownloadedSubscriptionHandler() {
        for await (const event of this.videoDownloadedSubscription) {
            const decodedData = this.stringEncoder.decode(event.data)
            const parsedData = JSON.parse(decodedData);
            if (parsedData?.requestId && parsedData?.url) {
                this.appStore.updateDownloadURL(
                    parsedData.requestId,
                    parsedData.url
                )
                console.log("video downloaded. URL - ", parsedData.url)
            }
        }
    }

    async registerVideoDownloadedErrorSubscriptionHandler() {
        for await (const event of this.videoDownloadErrorSubscription) {
            const decodedData = this.stringEncoder.decode(event.data)
            const parsedData = JSON.parse(decodedData);
            if (parsedData?.requestId) {
                this.appStore.markVideoRequestAsFailed(
                    parsedData.requestId,
                    parsedData?.error
                )
            }
        }
    }

    start() {
        const port = process.env.PORT
        this.app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }
}

module.exports = App;