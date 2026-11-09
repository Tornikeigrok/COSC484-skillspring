require('dotenv').config();

const { executeVerificationQueue } = require('./workers/emailWorker');
const { inspectNewtask } = require('./workers/taskWorker');


async function start() {
    executeVerificationQueue();
    inspectNewtask();

    console.log('worker process running...');
}

start();
