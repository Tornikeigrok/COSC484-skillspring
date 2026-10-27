const { FREE_EMAIL_DOMAINS } = require('../constants/companyConstants');

// "https://www.Acme.com:8443/about" -> "acme.com". Returns null when the host is not a real domain name
// (no dot, an IP address, "localhost", ...).
function websiteDomain(url) {
    let host;
    try {
        host = new URL(url).hostname.toLowerCase();
    } catch (e) {
        return null;
    }

    host = host.replace(/\.$/, '').replace(/^www\./, '');
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return null;
    if (/^\d+$/.test(host.split('.').pop())) return null; // IPv4 address
    return host;
}

// "eng.acme.com" is inside "acme.com", but "evilacme.com" and "acme.com.evil.com" are not.
function isSameOrSubdomain(domain, parent) {
    return domain === parent || domain.endsWith('.' + parent);
}

function isFreeEmailDomain(domain) {
    return FREE_EMAIL_DOMAINS.some((free) => isSameOrSubdomain(domain, free));
}

// Same website once normalised (trailing slash, host case, ...). Both null counts as the same.
function sameWebsite(a, b) {
    if (!a || !b) return !a && !b;
    try {
        return new URL(a).href === new URL(b).href;
    } catch (e) {
        return a === b;
    }
}

module.exports = { websiteDomain, isSameOrSubdomain, isFreeEmailDomain, sameWebsite };
