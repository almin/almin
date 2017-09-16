"use strict";
/*
    Test memory leak of StoreGroup cache.

    assert(startMemory - endMemory < 10MB);
 */
const assert = require("assert");
const pretty = require("prettysize");
const Store = require("almin").Store;
const StoreGroup = require("almin").StoreGroup;
console.log("= StoreGroup perf test");
const gc = () => {
    if (global.gc) {
        global.gc();
    } else {
        console.log(
            "Garbage collection unavailable.  Pass --expose-gc " +
                "when launching node to enable forced garbage collection."
        );
    }
};
const usage = () => {
    return pretty(process.memoryUsage().heapTotal);
};
class AStore extends Store {
    constructor() {
        super();
        this.state = "value";
    }

    updateSate(state) {
        this.state = state;
    }

    getState() {
        return this.state;
    }
}
class BStore extends Store {
    constructor() {
        super();
        this.state = "value";
    }

    updateSate(state) {
        this.state = state;
    }

    getState() {
        return this.state;
    }
}

const aStore = new AStore();
const bStore = new BStore();
const storeGroup = new StoreGroup({
    a: aStore,
    b: bStore
});
let currentState = storeGroup.getState();

// ========= START ===========
const startHeapTotal = process.memoryUsage().heapTotal;

const perfMemory = () => {
    // before
    gc();
    console.log("before", usage());
    for (let i = 0; i < 10000; i++) {
        aStore.updateSate({ a: i });
        bStore.updateSate({ b: i });
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
    const diffHeapMemory = process.memoryUsage().heapTotal - startHeapTotal;
    const MB = 1024 * 1000 * 10;
    console.log("finish", usage());
    console.log("diffMemory:", pretty(diffHeapMemory));
    assert(diffHeapMemory < MB, "after gc(), HeapMemory diff should be less 10MB");
}, 10);
