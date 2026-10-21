require('dotenv').config();

const { executeVerificationQueue } = require('./workers/emailWorker');


async function start() {

    executeVerificationQueue();

    console.log('worker process running...');
}

start();
