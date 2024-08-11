const { connect } = require("nats");
const dotenv = require("dotenv");

// modules
const App = require("./modules/app")

async function loadApp() {
    try {
        // load ENV variables
        dotenv.config();

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
        process.exit(0)
    }
}

loadApp();