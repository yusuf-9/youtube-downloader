const { connect } = require("nats");
const dotenv = require("dotenv");

const App = require("./modules/app")

async function loadApp() {
    try {
        // load ENV variables
        dotenv.config();

        // connect to NATS server
        const natsConnection = await connect({
            servers: process.env.NATS_SERVER_URL
        });

        // instantiate the app and NATS subscriptions
        const app = new App(natsConnection);
        
        // register all subscription handlers for the app
        app.registerSubscriptionHandlers();
    } catch (e) {
        console.error(e)
        process.exit(0)
    }
}

loadApp();

// TODO - store files in s3
// TODO - Create a store for storing tasks
// TODO - Cancel processes if their corresponding tasks are cancelled
