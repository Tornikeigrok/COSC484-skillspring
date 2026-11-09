const { Worker, UnrecoverableError } = require('bullmq');
const { getRedisConnection } = require('../utils/redisConnection');
const AdmZip = require('adm-zip');
const path = require('path');
const { TASK_UPLOAD_DIR, TASK_STATUS } = require('../constants/taskConstants');
const { MAX_FILE_SIZE, MAX_TOTAL_SIZE, MAX_FILE_COUNT } = require('../constants/taskConstants');
const { AUTO_RUN_SCRIPTS, DANGEROUS_COMMAND, BLOCKED_EXTENSIONS, SOFT_AUTO_RUN_FILE, UNSCANNED_CODE, INERT_EXTENSIONS } = require('../constants/taskConstants');
const { Task } = require('../models');
const { reviewTask } = require('../services/taskReviewService');
const zlib = require('zlib');


function readEntry(entry) {
    const raw = entry.getCompressedData();
    // 0 - file was put in zip as-is, not compressed, so nothing to unpack
    if (entry.header.method === 0) return raw;
    
    // 8 - file as compressed with deflate, so we need to unpack it
    if (entry.header.method === 8) {
        try {
            return zlib.inflateRawSync(raw, { maxOutputLength: MAX_FILE_SIZE });
        } catch (err) {
            throw new UnrecoverableError(`${entry.entryName} could not be safely unpacked`);
        }
    }
    return null;
}

function inspectNewtask() {
    const work = new Worker('just-posted-task-queue', async job => {
        const { taskId, storedFilename } = job.data;

        const zip = new AdmZip(path.join(TASK_UPLOAD_DIR, storedFilename));

        const entries = zip.getEntries();

        if (entries.length > MAX_FILE_COUNT) {
            throw new UnrecoverableError('Zip has too many files');
        }

        let totalSize = 0
        for (const entry of entries) {
            if (entry.isDirectory) continue;

            if (entry.header.size > MAX_FILE_SIZE) {
                throw new UnrecoverableError(`${entry.entryName} is too large`);
            }
            
            totalSize += entry.header.size;
            if (totalSize > MAX_TOTAL_SIZE) {
               throw new UnrecoverableError('Zip is too large when unpacked');
            }
        }

        let totalRead = 0;
        let hasUnscanned = false;
        const hardFlags = [];
        const softFlags = [];
        const textFiles = [];
        for (const entry of entries) {
            if (entry.isDirectory) continue;

            const name = entry.entryName.replace(/\\/g, '/').toLowerCase();
            const ext = path.extname(name);

            if (name.includes('.git/hooks/') || BLOCKED_EXTENSIONS.has(ext)) {
                hardFlags.push(`Blocked file: ${entry.entryName}`);
            }

            if (SOFT_AUTO_RUN_FILE.test(name)) {
               softFlags.push(`Auto-run file: ${entry.entryName}`);
            }

            if (INERT_EXTENSIONS.has(ext)) continue;

            const data = readEntry(entry);
            if (!data || data.includes(0)) {
                hasUnscanned = true;
                continue;
            }

            totalRead += data.length;

            if (totalRead > MAX_TOTAL_SIZE) {
                throw new UnrecoverableError('Zip is too large when unpacked');
            }

            const content = data.toString('utf8');
            textFiles.push({ name: entry.entryName, content });

            const match = DANGEROUS_COMMAND.exec(content);
            if (match) {
               const line = content.slice(0, match.index).split('\n').length;
               hardFlags.push(`Dangerous command in ${entry.entryName} at line ${line}`);
            }

            if (path.posix.basename(name) === 'package.json') {
                try {
                    const scripts = JSON.parse(content).scripts || {};
                    for (const script of AUTO_RUN_SCRIPTS) {
                        if (scripts[script]) {
                            softFlags.push(`${entry.entryName} has ${script}: ${scripts[script]}`);
                        }
                    }
                } catch (err) {
                    hardFlags.push(`${entry.entryName} is not valid JSON`);
                }
            }
        }
       
        if (hardFlags.length > 0) {
          await Task.update(
            {
               status: TASK_STATUS.REJECTED,
               rejected_reason: hardFlags,
            }, { where: { id: taskId }}
          );
          return;
        }

        const aiReview = await reviewTask(softFlags, textFiles);
        if (aiReview.verdict === 'approve') {
            await Task.update(
                hasUnscanned 
                 ?
                { status: TASK_STATUS.ESCALATED, rejected_reason: UNSCANNED_CODE }
                : { status: TASK_STATUS.OPEN },
              { where: { id: taskId } }
            );
        }
        if (aiReview.verdict === 'reject') {
            await Task.update(
                {
                    status: TASK_STATUS.REJECTED,
                    rejected_reason: aiReview.reasons,
                }, { where: { id: taskId }}
            );
        }
        if (aiReview.verdict === 'escalate') {
            await Task.update(
                {
                    status: TASK_STATUS.ESCALATED,
                    rejected_reason: aiReview.reasons,
                }, { where: { id: taskId }}
            );
        }
    }, { connection: getRedisConnection() });

    work.on('failed', async (job, err) => {
        console.error(job?.id, err);
        if (!job) return;
        const finalAttempt = err instanceof UnrecoverableError || job.attemptsMade >= job.opts.attempts;
        if (finalAttempt) {
           await Task.update(
              { status: TASK_STATUS.ESCALATED, rejected_reason: ['Automated review could not complete'] },
              { where: { id: job.data.taskId } }
           ).catch(console.error);
    }
    })

    return work;
}


module.exports = {
    inspectNewtask,
}
