// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const sinon = require("sinon");
import { Store } from "../lib/Store";
import { NoDispatchUseCase } from "./use-case/NoDispatchUseCase";
import { StoreGroup } from "../lib/UILayer/StoreGroup";
import { Context } from "../lib/Context";
import { Dispatcher } from "../lib/Dispatcher";
describe("StoreGroup edge case", function() {
    // See https://github.com/almin/almin/issues/179
    describe("when call Store#emitChange in Store#receivePayload", () => {
        it("should not infinity loop", () => {
            class AStore extends Store {
                constructor() {
                    super();
                    this.state = 0;
                }

                receivePayload() {
                    this.state = this.state + 1;
                    this.emitChange();
                }

                getState() {
                    return this.state;
                }
            }
            const aStore = new AStore();
            const storeGroup = new StoreGroup({ a: aStore });
            const context = new Context({
                dispatcher: new Dispatcher(),
                store: storeGroup
            });

            let count = 0;
            context.onChange(() => {
                count++;
            });
            return context.useCase(new NoDispatchUseCase()).execute().then(() => {
                assert(count === 1);
            });
        });
    });
});
