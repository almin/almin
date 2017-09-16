// MIT © 2017 azu
"use strict";
/**
 * This task measure performance of a lot of stores.
 */
const { createContext, createStore, createUseCase } = require("../almin-current");
const numberOfStore = 500;
const stores = Array.from(new Array(numberOfStore), (_, i) => i).map(index => {
    return createStore(`Store${index}`);
});
/**
 * @type {Context}
 */
const context = createContext(stores);
const useCase = createUseCase({ a: 1 });
let startTimeStamp, didTimeStamp, completeTimeStamp, onChangeTimeStamp;
context.onWillExecuteEachUseCase((payload, meta) => {
    startTimeStamp = meta.timeStamp;
});
context.onDidExecuteEachUseCase((payload, meta) => {
    didTimeStamp = meta.timeStamp;
});
context.onCompleteEachUseCase((payload, meta) => {
    completeTimeStamp = meta.timeStamp;
});
context.onChange(() => {
    onChangeTimeStamp = Date.now();
});
context
    .useCase(useCase)
    .execute()
    .then(() => {
        console.log(`UseCase will -> did: ${didTimeStamp - startTimeStamp}ms`);
        console.log(`UseCase will -> complete: ${completeTimeStamp - startTimeStamp}ms`);
        console.log(`Token Update State time: ${onChangeTimeStamp - startTimeStamp}ms`);
    });
