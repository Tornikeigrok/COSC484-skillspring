const { BadRequestError } = require("./httpExceptions");
const { TASK_TYPE, TASK_DIFFICULTY } = require('../constants/taskConstants');


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

function checkFile(file) {
    if (!file) {
        throw new BadRequestError('Zip file is required');
    }
    const isZip = file.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    if (!isZip) {
        throw new BadRequestError('File must be a valid zip');
    }
}


module.exports = {
    checkTitle,
    checkDesc,
    checkTaskType,
    checkEstHrs,
    checkDifficulty,
    checkFile,
}
