// LICENSE : MIT
"use strict";
import assert from "power-assert"
import ActionCreator from "../examples/counter/src/ActionCreator"
import ActionEmitter from "../src/flux/ActionEmitter"
describe("ActionCreator", function () {
    var dispatcher;
    var action;
    beforeEach(function () {
        dispatcher = new ActionEmitter();
        action = new ActionCreator(dispatcher);
    });
    describe("countUp", function () {
        it("should emit `countUp` event", function (done) {
            var expectedCount = 42;
            dispatcher.onAction(action => {
                assert.equal(action.count, expectedCount);
                done();
            });
            action.countUp(expectedCount);
        });
    });
});