const { BadRequestError } = require("./httpExceptions");
const { TASK_TYPE, TASK_DIFFICULTY, TASK_UPLOAD_DIR } = require('../constants/taskConstants');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');


function checkText(value, field, max) {
    if (typeof value !== 'string' || !value.trim()) { // null or undefined
        throw new BadRequestError(`${field} cannot be empty`);
    }
    const text = value.trim();
    if (text.length > max) {
        throw new BadRequestError(`${field} cannot exceed ${max} characters`);
    }
    return text;
}

const checkTitle = (title) => checkText(title, 'Title', 150);
const checkDesc = (desc) => checkText(desc, 'Description', 5000);

function checkTaskType(type) {
    if (!Object.values(TASK_TYPE).includes(type)) {
        throw new BadRequestError('Unknown task type');
    }
}

function checkDifficulty(difficulty) {
    if (!Object.values(TASK_DIFFICULTY).includes(difficulty)) {
        throw new BadRequestError('Unknown task difficulty');
    }
}

function checkEstHrs(value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        throw new BadRequestError('Estimated hours must be a whole number');
    }
    const hours = Number(value);
    if (hours < 1 || hours > 200) {
        throw new BadRequestError('Estimated hours must be between 1 and 200');
    }
    return hours;
}

function checkDeadline(value) {
    const deadline = new Date(value);
    if (typeof value !== 'string' || !value.trim() || isNaN(deadline)) {
        throw new BadRequestError('Deadline must be a valid date');
    }
    if (deadline <= new Date()) {
        throw new BadRequestError('Deadline must be in the future');
    }
    return deadline;
}

function checkFileExists(file) {
    if (!file) {
        throw new BadRequestError('Zip file is required');
    }
    const isZip = file.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    if (!isZip) {
        throw new BadRequestError('File must be a valid zip');
    }
}


const MAX_TASK_ID = 2147483647; // largest value the integer id column can hold

// Ids arrive as strings in the URL
function parseTaskId(value, label = 'task') {
    if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > MAX_TASK_ID) {
        throw new BadRequestError(`Invalid ${label} id`);
    }
    return Number(value);
}

// Optional free text, empty means none
function checkNotes(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') {
        throw new BadRequestError('Notes must be text');
    }
    const text = value.trim();
    if (text.length > 2000) {
        throw new BadRequestError('Notes cannot exceed 2000 characters');
    }
    return text || null;
}

/**
 * Create random UUID for each zip so names don't collide
 * mkdir will create a folder in which all zips will go
 * each zip then has to be written into the created folder.
 */
async function saveZip(file) {
    const storedFilename = `${crypto.randomUUID()}.zip`;
    await fs.mkdir(TASK_UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(TASK_UPLOAD_DIR, storedFilename), file.buffer);
    return storedFilename;
}

module.exports = {
    checkTitle,
    checkDesc,
    checkTaskType,
    checkEstHrs,
    checkDeadline,
    checkDifficulty,
    checkFileExists,
    parseTaskId,
    checkNotes,
    saveZip,
}
