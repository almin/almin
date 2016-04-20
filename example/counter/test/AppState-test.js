// LICENSE : MIT
"use strict";
import assert from "power-assert"
import AppState from "../examples/counter/src/AppState"
import ActionCreator from "../examples/counter/src/ActionCreator"
import ActionEmitter from "../src/flux/ActionEmitter"
const actionEmitter = new ActionEmitter();
const actionCreator = new ActionCreator(actionEmitter);
describe("AppState", function () {
    describe("getState", function () {
        it("should return initial state", function () {
            const store = new AppState(actionEmitter);
            assert.deepEqual(store.getState(), {count: 0});
        });
        it("after action, should return changed state", function (done) {
            const store = new AppState(actionEmitter);
            store.onChange(() => {
                assert.deepEqual(store.getState(), {count: 10});
                done();
            });
            actionCreator.countUp(10);
        });
    });
});