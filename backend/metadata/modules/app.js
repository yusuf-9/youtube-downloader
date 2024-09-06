const StringCodec = require('nats').StringCodec
const util = require('util');
const { DEFAULT_FORMATS_CONFIG, DEFAULT_RESOLUTION } = require('../constants');
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
                JSON.stringify({
                    metaData: this.formatMetaData(parsedData),
                    requestId
                })
            );
        } catch (error) {
            this.publishEvent(
                process.env.NATS_EVENT_VIDEO_DOWNLOAD_REQUEST_FAILED,
                JSON.stringify({ requestId, error: error?.message })
            );
            console.error(`Failed to fetch video metadata: ${error.message}`);
        }
    }

    formatMetaData(metaData) {
        const formatResolutions = metaData?.formats?.reduce((acc, format) => {
            if (!acc?.includes(format?.resolution)) {
                acc.push(format?.resolution);
            }
            return acc;
        }, [])

        const videoResolutions = formatResolutions
            ?.reduce((acc, format) => {
                if (this.validateVideoResolution(format)) {
                    acc.push(format);
                }

                return acc;
            }, [])
            ?.sort((a, b) => {
                const resolutionA = Number(a?.split("x")?.[1]);
                const resolutionB = Number(b?.split("x")?.[1]);
                return resolutionB - resolutionA;
            });

        return {
            id: metaData?.id,
            title: metaData?.title,
            duration: metaData?.duration,
            thumbnail: metaData?.thumbnail,
            webpage_url: metaData?.webpage_url,
            formats: {
                ...DEFAULT_FORMATS_CONFIG,
                video: {
                    ...DEFAULT_FORMATS_CONFIG.video,
                    resolutions: [
                        DEFAULT_RESOLUTION,
                        ...videoResolutions
                    ]
                }
            }
        }
    }

    publishEvent(eventName, eventData) {
        this.natsConnection.publish(eventName, this.stringEncoder.encode(eventData))
    }

    validateVideoResolution(resolution) {
        const formatPatten = /^\d+x\d+$/;
        return formatPatten.test(resolution);
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