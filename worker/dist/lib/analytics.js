"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GA_EVENTS = void 0;
exports.trackEvent = trackEvent;
exports.GA_EVENTS = {
    GENERATE_START: 'generate_start',
    GENERATE_COMPLETE: 'generate_complete',
};
function trackEvent({ action, category, label, value, ...rest }) {
    // Works in browser; no-op in Node (worker never calls this function)
    const g = globalThis;
    if (typeof g['window'] === 'undefined')
        return;
    const gtag = g['window']['gtag'];
    if (typeof gtag !== 'function')
        return;
    gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
        ...rest,
    });
}
