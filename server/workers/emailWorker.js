const { Worker } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');
const { verificationEmail, ndaEmail } = require('../templates/verificationEmail');
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

function executeNdaEmail() {
    const worker = new Worker('nda-email-queue', async job => 
      { 
        const { data } = job;
        const email = data.email
        const link = data.link;
        const id = data.id;

        // send the email with the link above, to the email above
        const { subject, html, text } = ndaEmail({ link });

        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: process.env.MAILGUN_FROM,
            to: email,
            subject,
            html,
            text
        });

        console.log('nda email sent');
      }
    , { connection: getRedisConnection(), });

    worker.on('failed', (job, err) => console.error('nda email failed', job?.id, err));

    return worker;
}


module.exports = { executeVerificationQueue, executeNdaEmail };
