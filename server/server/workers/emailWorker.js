const { Worker } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');
const { verificationEmail } = require('../templates/verificationEmail');
const { mg } = require('../utils/mailgun');

function executeVerificationQueue() {
    const job = new Worker('verification-email-queue', async job => 
     {
        const { data } = job;
        const code = data.code;
        console.log('data', data);

        const { subject, html, text } = verificationEmail({ code, type: data.type });

        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: process.env.MAILGUN_FROM,
            to: data.data.email,
            subject,
            html,
            text,
        });

        console.log('email sent');
     },
     { connection: getRedisConnection() }
    );

    return job;
}

module.exports = { executeVerificationQueue };
