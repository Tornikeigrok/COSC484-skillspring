const { Queue } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');

let queue = null;
function checkQueue() {
  if (!queue) {
    queue = new Queue('just-posted-task-queue', {
        connection: { ...getRedisConnection(), enableOfflineQueue: false },
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 10000 // 10s, 20s, ...
            },
            removeOnComplete: true,
            removeOnFail: {
                age: 86400
            }
        }
    });
  }
  return queue;
}


/**
 * @param {*} data - called in companyService, provides userId + zip file to inspect
 */
async function queueTaskCheck(data) {
    const job = checkQueue();
    if (!job) return null;

    await job.add('just-posted-task-enqueue', {
        ...data,
        queuedAt: new Date().toISOString(),
    }, 
    {
        jobId: `validate-new-task-${data.taskId}`,
    },
   );

  return job;
}

module.exports = { queueTaskCheck };
