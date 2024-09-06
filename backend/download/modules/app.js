const path = require('path');
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

const StringCodec = require('nats').StringCodec
const { AUDIO_FORMAT_EXTENSIONS, VIDEO_FORMAT_EXTENSIONS } = require('../constants');
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

            const rawFileName = requestId + '-raw.' + (isAudioFormat ? 'mp3' : 'webm');

            const downloadPath = path.join(__dirname, '../downloads', rawFileName);

            const ytDownloadCommand = `yt-dlp -f ${isAudioFormat ?
                'bestaudio --extract-audio --audio-format mp3 --audio-quality 0' :
                'bestvideo+bestaudio'
                } -o "${downloadPath}" "${url}"`

            const { error } = await exec(ytDownloadCommand);
            if (error) {
                throw new Error(error?.message || "Error downloading video")
            }

            const convertedFileOutputPath = path.join(__dirname, '../converts', `${requestId}.${formatExtension}`);
            await this.convertFileIntoSpecifiedFormat(
                formatExtension,
                formatResolution,
                downloadPath,
                convertedFileOutputPath
            )

            await this.uploadFileToS3(
                convertedFileOutputPath,
                `${requestId}.${formatExtension}`,
                requestId,
            )
        } catch (error) {
            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_FAILED,
                JSON.stringify({ requestId, error: error?.message })
            );
            console.error('Failed to download video', error?.message)
        }
    }

    async getDownloadedFileExtension(downloadPath) {
        const files = await fs.readdir(path.dirname(downloadPath));
        const downloadedFile = files.find(file => file.startsWith(path.basename(downloadPath)));

        if (!downloadedFile) {
            throw new Error('Downloaded file not found.');
        }

        return path.extname(downloadedFile); // Returns the file extension, e.g., ".mp4", ".webm"
    };

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

    async uploadFileToS3(downloadPath, remoteFileName, requestId) {
        const s3Url = await this.storageService.uploadFile(
            downloadPath,
            remoteFileName
        );
        this.publishEvent(
            process.env.NATS_EVENT_VIDEO_DOWNLOADED,
            JSON.stringify({ url: s3Url, requestId })
        );
        this.deleteFile(downloadPath);
    }

    async convertFileIntoSpecifiedFormat(extension, resolution, downloadedFilePath, outputFilePath,) {
        let ffmpegCommand;

        switch (true) {
            case AUDIO_FORMAT_EXTENSIONS.includes(extension):
                ffmpegCommand = `ffmpeg -i "${downloadedFilePath}" -b:a ${resolution} "${outputFilePath}"`;
                break;
            case VIDEO_FORMAT_EXTENSIONS.includes(extension):
                ffmpegCommand = `ffmpeg -i "${downloadedFilePath}" -vf "scale=${resolution}" "${outputFilePath}"`;
                break;
            default:
                break;
        }

        if (!ffmpegCommand) {
            throw new Error('Unsupported format. Please specify a valid output format.');
        }

        // Execute the ffmpeg command to convert the file
        await exec(ffmpegCommand);

        // delete the downloaded file
        this.deleteFile(downloadedFilePath);
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