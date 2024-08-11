const StringCodec = require('nats').StringCodec
const { exec } = require('child_process');

class App {
    constructor(natsConnection) {
        this.natsConnection = natsConnection;
        this.stringEncoder = StringCodec();
        this.videoRequestSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_REQUEST_CREATED);
    }
    registerSubscriptionHandlers() {
        this.registerVideoRequestSubscriptionHandler()
    }

    async registerVideoRequestSubscriptionHandler() {
        for await (const event of this.videoRequestSubscription) {
            this.fetchVideoMetaData(event.data);
        }
    }

    fetchVideoMetaData(url) {
        exec(`yt-dlp --flat-playlist --dump-json "${url}"`, (error, stdout) => {
            if (error) {
                console.error(error);
            }

            try {
                const parsedData = JSON.parse(stdout);
                this.publishEvent(
                    process.env.NATS_EVENT_VIDEO_METADATA_FETCHED, 
                    JSON.stringify({ 
                        metaData: parsedData, 
                        url: url 
                    })
                );
            } catch (parseError) {
                console.error(parseError);
            }
        });
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }
}

module.exports = App;