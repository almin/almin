// LICENSE : MIT
"use strict";

/**
 * nextTick function
 */
export const raq = (function() {
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
    throw new Error("No Available requestFrameAnimation or process.nextTick");
}());