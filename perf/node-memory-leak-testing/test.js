"use strict";
/*
    Test memory leak of StoreGroup cache.

    assert(startMemory - endMemory < 1MB);
 */
const assert = require("assert");
const pretty = require('prettysize');
const Store = require("almin").Store;
const StoreGroup = require("almin").StoreGroup;
const gc = () => {
    if (global.gc) {
        global.gc();
    } else {
        console.log('Garbage collection unavailable.  Pass --expose-gc '
            + 'when launching node to enable forced garbage collection.');
    }
};
const usage = () => {
    console.log(process.memoryUsage().heapTotal);
    return pretty(process.memoryUsage().heapTotal);
};
class AStore extends Store {
    getState() {
        return {a: "a value"};
    }
}
class BStore extends Store {
    getState() {
        return {b: Math.random()};
    }
}
const aStore = new AStore();
const bStore = new BStore();
const storeGroup = new StoreGroup([aStore, bStore]);
let currentState = storeGroup.getState();

// ========= START ===========
const startHeapTotal = process.memoryUsage().heapTotal;

const perfMemory = () => {
    // before
    gc();
    console.log("before", usage());
    for (let i = 0; i < 10000; i++) {
        aStore.emitChange();
        bStore.emitChange();
        storeGroup.emitChange();
        currentState = storeGroup.getState();
    }
    console.log("after", usage());
    gc();
    console.log("after:gc", usage());
    console.log("----------------------------------");
};

for (let i = 0; i < 10; i++) {
    perfMemory();
}
gc();

setTimeout(() => {
    const diffHeapMemory = startHeapTotal - process.memoryUsage().heapTotal;
    const MB = 1024 * 1000;
    assert(diffHeapMemory < MB, "after gc(), HeapMemory diff should be less 1MB");
}, 10);