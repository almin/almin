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
        let startTimeStamp,
            onChangeTimeStamp,
            updateCount = 0;
        startTimeStamp = Date.now();
        context.onChange(() => {
            onChangeTimeStamp = Date.now();
            updateCount++;
        });
        // execute usecase
        const useCase = almin.createUseCase();
        context
            .transaction("transaction", transactionContext => {
                return transactionContext
                    .useCase(useCase)
                    .execute(1)
                    .then(() => transactionContext.useCase(useCase).execute(2))
                    .then(() => transactionContext.useCase(useCase).execute(3))
                    .then(() => transactionContext.useCase(useCase).execute(4))
                    .then(() => transactionContext.useCase(useCase).execute(5))
                    .then(() => {
                        transactionContext.commit();
                    });
            })
            .then(() => {
                resolve({
                    updateTime: (onChangeTimeStamp || Date.now()) - startTimeStamp,
                    updateCount
                });
                context.release();
            });
    });
}

const timeStamp = Date.now();
const outputCSVPath = path.join(__dirname, "output", `transaction-${timeStamp}.csv`);
// 0...350 stores
const storeRanges = range(0, 350, 5);
// count
const resultsCurrent = [];
storeRanges.forEach(count => {
    queue.add(() => {
        return runStore(alminCurrent, count).then(({ updateTime, updateCount }) => {
            resultsCurrent.push({
                count,
                updateCount,
                updateTime
            });
        });
    });
});

queue.onEmpty().then(() => {
    var fields = ["count", "updateCount", "updateTime"];
    var myCars = resultsCurrent;
    var csv = json2csv({ data: myCars, fields: fields, del: "\t" });
    console.log(csv);
    fs.writeFileSync(outputCSVPath, csv, "utf-8");
});
