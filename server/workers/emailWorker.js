const { Worker } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');

function executeVerificationQueue() {
    const job = new Worker('verification-email-queue', async job => 
     {
        const { data } = job.data;
        // Worker needs to send the email to designated email + generated code
     },
     { connection: getRedisConnection() }
    );

    return job;
}

module.exports = { executeVerificationQueue };
