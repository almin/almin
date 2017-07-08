// MIT © 2017 azu
"use strict";
import { UnitOfWork } from "../lib/UnitOfWork/UnitOfWork";
import { Payload } from "../lib/index";
import * as assert from "assert";

const createMockStoreGroup = () => {
    const committedPayloads = [];
    return {
        committedPayloads,
        mockStoreGroup: {
            commit(payload) {
                committedPayloads.push(payload);
            }
        }
    };
};

describe("UnitOfWork", () => {
    describe("#addPayload", () => {
        it("can add new Payload", () => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            assert.equal(unitOfWork.size, 0);
            unitOfWork.addPayload(new Payload({ type: "Example" }));
            assert.equal(unitOfWork.size, 1);
            unitOfWork.addPayload(new Payload({ type: "Example" }));
            assert.equal(unitOfWork.size, 2);
        });
    });
    describe("#onNewPayload", () => {
        it("this handler should called when add new Payload", (done) => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            const newPayload = new Payload({ type: "Example" });
            unitOfWork.onNewPayload((payload) => {
                assert.strictEqual(payload, newPayload, "added payload");
                done();
            });
            unitOfWork.addPayload(newPayload);
        });
    });
    describe("#commit", () => {
        it("can commit when size is 0", () => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            unitOfWork.commit();
            assert.strictEqual(unitOfWork.size, 0);
        });
        it("size should be 0 after commit", () => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            unitOfWork.addPayload(new Payload({ type: "Example" }));
            unitOfWork.commit();
            assert.strictEqual(unitOfWork.size, 0);
        });
        it("commitable should be committed by UnitOfWork", () => {
            const { mockStoreGroup, committedPayloads } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            const payloadA = new Payload({ type: "Example" });
            const payloadB = new Payload({ type: "Example" });
            unitOfWork.addPayload(payloadA);
            unitOfWork.addPayload(payloadB);
            unitOfWork.commit();
            assert.deepStrictEqual(committedPayloads, [payloadA, payloadB]);
        });
    });

});
