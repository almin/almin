const perf = ('performance' in global) ? global.performance : {};
const now = perf.now ||
    perf.mozNow ||
    perf.msNow ||
    perf.oNow ||
    perf.webkitNow ||
    // fallback to Date
    Date.now || function () {
        return new Date().getTime();
    };
export default function performanceNow() {
    return now();
}