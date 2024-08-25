const StringCodec = require('nats').StringCodec
const path = require('path');
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

class App {
    constructor(natsConnection, storageService) {
        this.natsConnection = natsConnection;
        this.stringEncoder = StringCodec();
        this.videoDownloadRequestSubscription = natsConnection.subscribe(
            process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED,
            { queue: process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_RECIEVED_QUEUE_NAME }
        );
        this.storageService = storageService;
    }
    registerSubscriptionHandlers() {
        this.registerVideoDownloadRequestSubscriptionHandler()
    }

    async registerVideoDownloadRequestSubscriptionHandler() {
        for await (const event of this.videoDownloadRequestSubscription) {
            this.createErrorBoundary(() => {
                const decodedData = this.stringEncoder.decode(event?.data);
                const parsedData = JSON.parse(decodedData);
                if (parsedData?.videoId && parsedData?.requestId) {
                    this.downloadVideoAndStoreItToS3(
                        parsedData?.videoId,
                        parsedData?.format?.id,
                        parsedData?.format?.extension,
                        parsedData?.requestId
                    );
                }
            })
        }
    }

    async downloadVideoAndStoreItToS3(videoId, formatId = "mp4", formatExtension = 'mp4', requestId) {
        try {
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            const fileName = `${videoId}-${Math.ceil(Math.random() * 10000)}.${formatExtension}`
            const downloadPath = path.join(__dirname, '../downloads', fileName);

            const { error } = await exec(`yt-dlp -f ${formatId} -o "${downloadPath}" ${url}`)
            if (error) {
                throw new Error(error?.message || "Error downloading video")
            }

            const s3Url = await this.storageService.uploadFile(
                downloadPath,
                fileName
            );
            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOADED,
                JSON.stringify({ url: s3Url, requestId })
            );
            this.deleteFile(downloadPath);
        } catch (error) {
            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_FAILED,
                JSON.stringify({ requestId, error: error?.message })
            );
            console.error('Failed to download video', error?.message)
        }

    }

    async deleteFile(filePath) {
        this.createErrorBoundary(() => {
            const absolutePath = path.resolve(filePath);

            fs.unlink(absolutePath, (err) => {
                if (err) {
                    console.error(`Error deleting the file at ${absolutePath}:`, err);
                }
            });
        })
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