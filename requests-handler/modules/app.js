const express = require('express');
const StringCodec = require('nats').StringCodec

class App {
    constructor(natsConnection) {
        this.app = express();
        this.natsConnection = natsConnection
        this.stringEncoder = StringCodec()
        this.videoMetaDataFetchedSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_METADATA_FETCHED)
        this.videoDownloadedSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_DOWNLOADED)
    }

    configureServer() {
        this.app.use(express.json());

        this.app.post("/register-request", (req, res) => {
            const videoUrl = req.body?.url;
            this.publishEvent(process.env.NATS_EVENT_VIDEO_REQUEST_CREATED, videoUrl);
            res.status(200).send('Request received successfully');
        })
    }

    registerSubscriptionHandlers() {
        this.registerVideoMetaDataFetchedSubscriptionHandler();
        this.registerVideoDownloadedSubscriptionHandler();
    }

    async registerVideoMetaDataFetchedSubscriptionHandler() {
        for await (const event of this.videoMetaDataFetchedSubscription) {
            const decodedData = this.stringEncoder.decode(event.data)
            const videoId = JSON.parse(decodedData)
            if (videoId) {
                this.publishEvent(
                    process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED,
                    JSON.stringify(videoId)
                );
            }
        }
    }

    async registerVideoDownloadedSubscriptionHandler() {
        for await (const event of this.videoDownloadedSubscription) {
            const decodedData = this.stringEncoder.decode(event.data)
            const resourceURL = JSON.parse(decodedData)
            console.log("video downloaded. URL - ", resourceURL)
        }
    }

    start() {
        const port = process.env.PORT || 3000
        this.app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }
}

module.exports = App;