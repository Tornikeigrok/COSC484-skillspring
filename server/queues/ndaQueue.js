const { Queue } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');

let queue = null;
function checkQueue() {
    if (!queue) {
        queue = new Queue('nda-email-queue', {
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

    queue.on('error', (err) => console.error('nda-email-queue', err));

    return queue;
}

/**
 * data will consist of email of student being select and taskId
 * @param {*} data 
 */
async function queueNdaEmail(data) {
    const job = checkQueue();
    if (!job) return null;
    
    await job.add('send-nda-email', 
        {
            ...data,
            queuedAt: new Date().toISOString(),
        },
        {
            jobId: `nda-email-sent-${data.id}-${Date.now()}`,
        }
    );

    return job;
}

module.exports = { queueNdaEmail };
