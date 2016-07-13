var performanceNow;
if (typeof performance !== "undefined" && performance.now) {
    performanceNow = () => performance.now();
} else {
    performanceNow = () => Date.now();
}
export default performanceNow