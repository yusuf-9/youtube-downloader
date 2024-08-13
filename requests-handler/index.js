const { connect } = require("nats");
const dotenv = require("dotenv");

// modules
const App = require("./modules/app");
const Store = require("./modules/store");

async function loadApp() {
    try {
        // load ENV variables
        dotenv.config();

        // connect to NATS server
        const natsConnection = await connect({
            servers: process.env.NATS_SERVER_URL
        });

        // instantiate the app store
        const appStore = new Store();

        // instantiate the main app and NATS subscriptions
        const app = new App(natsConnection, appStore);

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