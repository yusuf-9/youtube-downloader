const StringCodec = require('nats').StringCodec
const path = require('path');
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

class App {
    constructor(natsConnection, storageService) {
        this.natsConnection = natsConnection;
        this.stringEncoder = StringCodec();
        this.videoDownloadRequestSubscription = natsConnection.subscribe(process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED);
        this.storageService = storageService;
    }
    registerSubscriptionHandlers() {
        this.registerVideoDownloadRequestSubscriptionHandler()
    }

    async registerVideoDownloadRequestSubscriptionHandler() {
        for await (const event of this.videoDownloadRequestSubscription) {
            const decodedData = this.stringEncoder.decode(event?.data);
            const videoId = JSON.parse(decodedData)
            if (videoId) this.downloadVideoAndStoreItToS3(videoId);
        }
    }

    async downloadVideoAndStoreItToS3(videoId, format = "mp4") {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const fileName = `${videoId}-${Math.ceil(Math.random() * 10000)}.${format}`
        const downloadPath = path.join(__dirname, '../downloads', fileName);

        const { error } = await exec(`yt-dlp -f ${format} -o "${downloadPath}" ${url}`)
        if (error) {
            console.error(error);
            return;
        }

        try {
            const s3Url = await this.storageService.uploadFile(
                downloadPath,
                fileName
            );
            this.publishEvent(process.env.NATS_EVENT_VIDEO_DOWNLOADED, JSON.stringify(s3Url));
        } catch (err) {
            console.error('Failed to upload to S3:', err);
            return;
        }

        this.deleteFile(downloadPath);
    }

    async deleteFile(filePath) {
        const absolutePath = path.resolve(filePath);

        fs.unlink(absolutePath, (err) => {
            if (err) {
                console.error(`Error deleting the file at ${absolutePath}:`, err);
            } else {
                console.log(`File deleted successfully: ${absolutePath}`);
            }
        });
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }
}

module.exports = App;