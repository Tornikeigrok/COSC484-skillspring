const { Queue } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');

let queue = null;
function checkQueue() {
    if (!queue) {
        queue = new Queue('verification-email-queue', {
            connection: getRedisConnection(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
                removeOnComplete: true,
                removeOnFail: {
                    age: 86400
                }
            }
        })
    }
    return queue;
}

async function queueVerificationEmail(data) {
    const job = checkQueue();
    if (!job) return null;
    
    await job.add('send-verification-email', 
      {
        ...data,
        queuedAt: new Date().toISOString(),
      },
      {
        jobId: `verification-email-${data.id}-${Date.now()}`,
      }
    );

    return job;
}

module.exports = { queueVerificationEmail };
