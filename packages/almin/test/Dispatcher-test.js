// LICENSE : MIT
"use strict";
const assert = require("assert");

import{ Dispatcher } from "../lib/Dispatcher";

describe("Dispatcher", function() {
    describe("#onDispatch", function() {
        it("should return un-listen function", function() {
            const dispatcher = new Dispatcher();
            const unListen = dispatcher.onDispatch(() => {
                // should not called
                throw new Error("don't called");
            });
            // when
            unListen();
            // then
            dispatcher.dispatch({ type: "???" });
        });
    });
    describe("#dispatch", function() {
        it("should dispatch with payload object, otherwise throw error", function() {
            const dispatcher = new Dispatcher();
            try {
                dispatcher.dispatch("it is not payload");
                throw new Error("UNREACHED");
            } catch (error) {
                assert(error.message !== "UNREACHED");
            }
        });
        it("should dispatch with payload object that has type propery", function(done) {
            const dispatcher = new Dispatcher();
            const expectedPayload = {
                type: { /* string Symbol anything */ }
            };
            dispatcher.onDispatch(payload => {
                assert.deepEqual(payload, expectedPayload);
                done();
            });
            dispatcher.dispatch(expectedPayload);
        });
        it("should pass payload object to listening handler", function(done) {
            const dispatcher = new Dispatcher();
            const expectedPayload = {
                type: "pay",
                value: 100
            };
            dispatcher.onDispatch(payload => {
                assert.deepEqual(payload, expectedPayload);
                done();
            });
            dispatcher.dispatch(expectedPayload);
        });
    });
});