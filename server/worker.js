require('dotenv').config();

const { executeVerificationQueue, executeNdaEmail } = require('./workers/emailWorker');
const { inspectNewtask } = require('./workers/taskWorker');


async function start() {
    executeVerificationQueue();
    executeNdaEmail();
    inspectNewtask();

    console.log('worker process running...');
}

start();
