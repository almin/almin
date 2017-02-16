// LICENSE : MIT
"use strict";
const nextTick = (function() {
    // Browser
    if (typeof requestAnimationFrame === "function") {
        return requestAnimationFrame;
    }

    // Other
    if (typeof setTimeout === "function") {
        return function nextTick(handler: Function) {
            setTimeout(handler, 0);
        };
    }
    throw new Error("No Available requestFrameAnimation or process.nextTick")
}());

/**
 * nextTick function
 * @type {function(Function)}
 */
export default nextTick;