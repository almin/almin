// LICENSE : MIT
"use strict";
const nextTick = (function() {
    // Browser
    if (typeof requestFrameAnimation === "function") {
        return requestFrameAnimation;
    }

    // Other
    if (typeof setTimeout === "function") {
        return function nextTick(handler) {
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