const StringCodec = require('nats').StringCodec
const { exec } = require('child_process');
const path = require('path');

class App {
    constructor(natsConnection) {
        this.natsConnection = natsConnection;
        this.stringEncoder = StringCodec();
        this.videoDownloadRequestSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED);
    }
    registerSubscriptionHandlers() {
        this.registerVideoDownloadRequestSubscriptionHandler()
    }

    async registerVideoDownloadRequestSubscriptionHandler() {
        for await (const event of this.videoDownloadRequestSubscription) {
            const decodedData = this.stringEncoder.decode(event?.data);
            const parsedData = JSON.parse(decodedData)
            const videoId = parsedData?.videoId;
            const format = parsedData?.format
            if(videoId) this.downVideoAndStoreItLocally(videoId, format);
        }
    }

    downVideoAndStoreItLocally(videoId, format = "mp4") {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const outputFilePath = path.join(__dirname, `${videoId}.${format}`);

        exec(`yt-dlp -f ${format} -o "${outputFilePath}" ${url}`, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
            }

            this.publishEvent(process.env.NATS_EVENT_VIDEO_DOWNLOADED, `${videoId}.${format}`)
        });
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }
}

module.exports = App;