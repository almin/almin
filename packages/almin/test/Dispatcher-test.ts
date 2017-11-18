// LICENSE : MIT
"use strict";
const assert = require("assert");
import { Dispatcher, Payload } from "../src/";

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
        it("when dispatch string, should throw error", function() {
            const dispatcher = new Dispatcher();
            try {
                dispatcher.dispatch("it is not payload" as any);
                throw new Error("UNREACHED");
            } catch (error) {
                assert(error.message !== "UNREACHED");
            }
        });
        it("when dispatch Payload instance that have not type, should throw error", function() {
            const dispatcher = new Dispatcher();

            // @ts-ignore: missing type
            class MyPayload extends Payload {}

            try {
                dispatcher.dispatch(new MyPayload());
                throw new Error("UNREACHED");
            } catch (error) {
                assert(error.message !== "UNREACHED");
            }
        });
        it("when dispatch Payload instance, should pass test", function(done) {
            const dispatcher = new Dispatcher();

            class MyPayload extends Payload {
                type: string;

                // Not have type
                constructor() {
                    super({ type: "MyPayload" });
                }
            }

            dispatcher.onDispatch(payload => {
                assert.ok(payload instanceof MyPayload);
                done();
            });
            dispatcher.dispatch(new MyPayload());
        });
        it("when dispatch with payload that has string type, should pass test", function(done) {
            const dispatcher = new Dispatcher();
            const expectedPayload = {
                type: "string type"
            };
            dispatcher.onDispatch(payload => {
                assert.deepEqual(payload, expectedPayload);
                done();
            });
            dispatcher.dispatch(expectedPayload);
        });
        it("when dispatch with payload that has object type, should pass test", function(done) {
            const dispatcher = new Dispatcher();
            const expectedPayload = {
                type: {
                    /* string Symbol anything */
                }
            };
            dispatcher.onDispatch(payload => {
                assert.deepEqual(payload, expectedPayload);
                done();
            });
            dispatcher.dispatch(expectedPayload);
        });
        it("when dispatch with payload object that has type property, should pass test", function(done) {
            const dispatcher = new Dispatcher();
            const expectedPayload = {
                type: {
                    /* string Symbol anything */
                }
            };
            dispatcher.onDispatch(payload => {
                assert.deepEqual(payload, expectedPayload);
                done();
            });
            dispatcher.dispatch(expectedPayload);
        });
        it("when dispatch payload object, listen handler catch the payload", function(done) {
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
