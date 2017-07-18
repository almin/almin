// MIT © 2017 azu
"use strict";
process.env.NODE_ENV = "production";

const alminCurrent = require("../../../almin-current");
const fs = require("fs");
const json2csv = require("json2csv");
const path = require("path");
const range = require("lodash.range");
const PQueue = require("p-queue");
const queue = new PQueue({ concurrency: 1 });
process.on("unhandledRejection", console.error);

function runStore(almin, storeCount) {
    return new Promise((resolve, reject) => {
        const stores = Array.from(new Array(storeCount), (_, i) => i).map(index => {
            return almin.createStore(`Store${index}`);
        });
        const context = almin.createContext(stores);
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
        // execute usecase
        const useCase = almin.createUseCase();
        context.useCase(useCase).execute({ newState: 1 }).then(() => {
            resolve({
                didExecutedTime: didTimeStamp - startTimeStamp,
                completeTime: completeTimeStamp - startTimeStamp,
                updateTime: (onChangeTimeStamp || Date.now()) - startTimeStamp
            });
            context.release();
        });
    });
}

const timeStamp = Date.now();
const outputCSVPath = path.join(__dirname, "output", `${timeStamp}.csv`);
// 0...350 stores
const storeRanges = range(0, 350, 5);
// count
const resultsCurrent = [];
storeRanges.forEach(count => {
    queue.add(() => {
        return runStore(alminCurrent, count).then(({ didExecutedTime, completeTime, updateTime }) => {
            resultsCurrent.push({
                count,
                didExecutedTime,
                completeTime,
                updateTime
            });
        });
    });
});

queue.onEmpty().then(() => {
    var fields = ["count", "didExecutedTime", "completeTime", "updateTime"];
    var myCars = resultsCurrent;
    var csv = json2csv({ data: myCars, fields: fields, del: "\t" });
    console.log(csv);
    fs.writeFileSync(outputCSVPath, csv, "utf-8");
});
