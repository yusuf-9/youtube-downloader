const express = require('express');
const StringCodec = require('nats').StringCodec

class App {
    constructor(natsConnection) {
        this.app = express();
        this.natsConnection = natsConnection
        this.stringEncoder = StringCodec()
        this.videoMetaDataFetchedSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_METADATA_FETCHED)
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
    }

    async registerVideoMetaDataFetchedSubscriptionHandler() {
        for await (const event of this.videoMetaDataFetchedSubscription) {
            const decodedData = this.stringEncoder.decode(event?.data);
            const parsedData = JSON.parse(decodedData)
            const videoId = parsedData?.metaData?.id;
            if (videoId) this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED,
                JSON.stringify({ videoId, format: "mp4" })
            );
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