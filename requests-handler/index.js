const { connect } = require("nats");
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

// modules
const App = require("./modules/app")

async function loadApp() {
    try {
        // load ENV variables
        dotenv.config();

        // create the downloads directory
        const downloadDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }

        // connect to NATS server
        const natsConnection = await connect({
            servers: process.env.NATS_SERVER_URL
        });

        // instantiate the main app and NATS subscriptions
        const app = new App(natsConnection);

        // configure the server
        app.configureServer();

        // register handlers for all nats subscriptions
        app.registerSubscriptionHandlers();

        // start the server
        app.start();
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

loadApp();