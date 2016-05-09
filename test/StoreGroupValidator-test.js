// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Store from "../src/Store";
import StoreGroup from "../src/UILayer/StoreGroup";
import StoreGroupValidator from "../src/UILayer/StoreGroupValidator";
import createEchoStore from "./helper/EchoStore";
describe("StoreGroupValidator", function () {
    describe("validateStores", function () {
        context("when duplicated stores", function () {
            it("should throw error", function () {
                const store1 = createEchoStore({name: "AStore"});
                const store2 = createEchoStore({name: "AStore"});
                assert.throws(() => {
                    StoreGroupValidator.validateStores([store1, store2]);
                });
            });
        })
    });
    describe("validateInstance", function () {
        context("when store is argument", function () {
            it("should not throw", function () {
                const store = new Store();
                StoreGroupValidator.validateInstance(store);
            });
        });
        context("when storeGroup is argument", function () {
            it("should not throw", function () {
                const aStore = createEchoStore({name: "AStore"});
                const bStore = createEchoStore({name: "BStore"});
                const storeGroup = new StoreGroup([aStore, bStore]);
                StoreGroupValidator.validateInstance(storeGroup);
            });
        });
    });
});