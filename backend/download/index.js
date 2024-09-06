const path = require('path');
const fs = require('fs');

const { connect } = require("nats");
const dotenv = require("dotenv");

const App = require("./modules/app")
const FileStorage = require("./modules/file-storage")

async function loadApp() {
    try {
        // load ENV variables
        dotenv.config();

        // connect to NATS server
        const natsConnection = await connect({
            servers: process.env.NATS_SERVER_URL
        });

        // connect to the file storage service
        const storageService = new FileStorage();

        // create download and convert directories if not present
        const downloadDir = path.join(__dirname, 'downloads');
        const convertsDir = path.join(__dirname, 'converts');
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
        if (!fs.existsSync(convertsDir)) fs.mkdirSync(convertsDir);
        

        // instantiate the app and NATS subscriptions
        const app = new App(natsConnection, storageService);

        // register all subscription handlers for the app
        app.registerSubscriptionHandlers();
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

loadApp();