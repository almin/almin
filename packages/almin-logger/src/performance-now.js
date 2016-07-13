var performanceNow;
/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
if (typeof performance !== "undefined" && performance.now) {
    performanceNow = () => performance.now();
} else {
    performanceNow = () => Date.now();
}
export default performanceNow