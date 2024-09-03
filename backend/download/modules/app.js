const StringCodec = require('nats').StringCodec
const path = require('path');
const util = require('util');
const fs = require('fs');
const { AUDIO_FORMAT_EXTENSIONS } = require('../constants');
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
                if (parsedData?.videoId && parsedData?.requestId && parsedData?.format) {
                    this.downloadVideoAndStoreItToS3(
                        parsedData?.videoId,
                        parsedData?.requestId,
                        parsedData?.format?.extension,
                        parsedData?.format?.resolution,
                    );
                }
            })
        }
    }

    async downloadVideoAndStoreItToS3(videoId, requestId, formatExtension = 'mp4', formatResolution = "best quality") {
        try {
            const isAudioFormat = AUDIO_FORMAT_EXTENSIONS.includes(formatExtension);

            const url = `https://www.youtube.com/watch?v=${videoId}`;

            const fileName = `${requestId}.${isAudioFormat ? 'mp3' : 'mp4'}`;
            const downloadPath = path.join(__dirname, '../downloads', fileName);

            const ytDownloadCommand = `yt-dlp -f ${isAudioFormat ?
                    'bestaudio --extract-audio --audio-format mp3 --audio-quality 0' :
                    'bestvideo+bestaudio --merge-output-format mp4'
                } -o "${downloadPath}" ${url}`

            const { error } = await exec(ytDownloadCommand)
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