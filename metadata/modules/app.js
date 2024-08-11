const StringCodec = require('nats').StringCodec
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class App {
    constructor(natsConnection) {
        this.natsConnection = natsConnection;
        this.stringEncoder = StringCodec();
        this.videoRequestSubscription = natsConnection.subscribe(
            process.env.NATS_EVENT_VIDEO_REQUEST_CREATED,
            {queue: process.env.NATS_EVENT_VIDEO_REQUEST_CREATED_QUEUE_NAME}
        );
    }
    registerSubscriptionHandlers() {
        this.registerVideoRequestSubscriptionHandler()
    }

    async registerVideoRequestSubscriptionHandler() {
        for await (const event of this.videoRequestSubscription) {
            this.fetchVideoMetaData(event?.data);
        }
    }

    async fetchVideoMetaData(url) {
        try {
            const { stdout } = await exec(`yt-dlp --flat-playlist --dump-json "${url}"`);
            const parsedData = JSON.parse(stdout);
            this.publishEvent(process.env.NATS_EVENT_VIDEO_METADATA_FETCHED, JSON.stringify(parsedData?.id));
        } catch (error) {
            console.error(`Failed to fetch video metadata: ${error.message}`);
        }
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }
}

module.exports = App;