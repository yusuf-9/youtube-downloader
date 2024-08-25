const StringCodec = require('nats').StringCodec
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class App {
    constructor(natsConnection) {
        this.natsConnection = natsConnection;
        this.stringEncoder = StringCodec();
        this.videoRequestSubscription = natsConnection.subscribe(
            process.env.NATS_EVENT_VIDEO_REQUEST_CREATED,
            { queue: process.env.NATS_EVENT_VIDEO_REQUEST_CREATED_QUEUE_NAME }
        );
    }
    registerSubscriptionHandlers() {
        this.registerVideoRequestSubscriptionHandler()
    }

    async registerVideoRequestSubscriptionHandler() {
        for await (const event of this.videoRequestSubscription) {
            this.createErrorBoundary(() => {
                const decodedData = this.stringEncoder.decode(event?.data)
                const parsedData = JSON.parse(decodedData)
                if (parsedData?.url && parsedData?.requestId) {
                    this.fetchVideoMetaData(parsedData?.url, parsedData?.requestId);
                }
            })
        }
    }

    async fetchVideoMetaData(url, requestId) {
        try {
            const { stdout } = await exec(`yt-dlp --skip-download --flat-playlist --dump-json "${url}"`);
            const parsedData = JSON.parse(stdout);
            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_METADATA_FETCHED,
                JSON.stringify({ metaData: parsedData, requestId })
            );
        } catch (error) {
            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_FAILED,
                JSON.stringify({ requestId, error: error?.message })
            );
            console.error(`Failed to fetch video metadata: ${error.message}`);
        }
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }

    createErrorBoundary(callback) {
        try {
            callback()
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = App;