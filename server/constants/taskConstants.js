const path = require('path');

const TASK_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
}

const TASK_STATUS = {
    OPEN: 'open',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    COMPLETED: 'completed',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
    IN_REVIEW: 'in_review',
    REJECTED: 'rejected',
}

const TASK_TYPE = {
    UI: 'ui',
    API: 'api',
    DATA: 'data',
    COMPONENT: 'component',
    SCRIPT: 'script',
    POC: 'poc',
}

const ASSET_TYPE = {
    ZIP: 'zip',
}

const TASK_UPLOAD_DIR = path.join(__dirname, '../uploads/tasks');

const MAX_FILE_SIZE = 10 * 1024 * 1024;   // 10 MB

const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200 MB

const MAX_FILE_COUNT = 5000;

const TEXT_EXTENSIONS = new Set(['.js', '.html', '.css', '.json', '.md', '.txt', '.py']);

const AUTO_RUN_SCRIPTS = ['preinstall', 'install', 'postinstall', 'prepare'];

const AUTO_RUN_FILE = /(^|\/)(\.git\/hooks\/|\.vscode\/tasks\.json$|setup\.py$)/;

const DANGEROUS_COMMAND = /(curl|wget)[^|\n]*\|\s*(ba|z)?sh\b|base64\s+(-d|--decode)[^|\n]*\|\s*(ba|z)?sh\b|\/dev\/tcp\/|\bnc\s+[^\n]*-e\b/i;

const BLOCKED_EXTENSIONS = new Set(['.exe', '.dll', '.so', '.msi', '.dmg', '.bat', '.cmd', '.ps1']);

const SOFT_AUTO_RUN_FILE = /(^|\/)(\.vscode\/tasks\.json|setup\.py)$/;


module.exports = {
    TASK_DIFFICULTY,
    TASK_STATUS,
    TASK_TYPE,
    ASSET_TYPE,
    TASK_UPLOAD_DIR,
    MAX_FILE_SIZE,
    MAX_TOTAL_SIZE,
    MAX_FILE_COUNT,
    TEXT_EXTENSIONS,
    AUTO_RUN_SCRIPTS,
    AUTO_RUN_FILE,
    DANGEROUS_COMMAND,
    BLOCKED_EXTENSIONS,
    SOFT_AUTO_RUN_FILE,
}
