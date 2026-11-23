const REVIEW_VERDICT = {
    ACCEPT: 'accept',
    REJECT: 'reject',
    REQUEST_CHANGES: 'request_changes',
}

// Rubric scores, 1 = needs work ... 4 = exceptional
const REVIEW_SCORE_MIN = 1;
const REVIEW_SCORE_MAX = 4;
const REVIEW_CRITERIA = ['functionality', 'quality', 'documentation', 'communication'];
const MAX_FEEDBACK_LENGTH = 5000;

module.exports = {
    REVIEW_VERDICT,
    REVIEW_SCORE_MIN,
    REVIEW_SCORE_MAX,
    REVIEW_CRITERIA,
    MAX_FEEDBACK_LENGTH,
}
