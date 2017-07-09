// MIT © 2017 azu
"use strict";
import { UnitOfWork } from "../lib/UnitOfWork/UnitOfWork";
import { Payload } from "../lib/index";
import * as assert from "assert";
import { DispatcherPayloadMetaImpl } from "../lib/DispatcherPayloadMeta";

const createMockStoreGroup = () => {
    const commitments = [];
    return {
        commitments,
        mockStoreGroup: {
            commit(payload) {
                commitments.push(payload);
            }
        }
    };
};
let commitmentId = 0;
const createCommitment = () => {
    return [new Payload({ type: `Example ${commitmentId++}` }), new DispatcherPayloadMetaImpl({})];
};
describe("UnitOfWork", () => {
    describe("#addCommitment", () => {
        it("can add new commitment", () => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            assert.equal(unitOfWork.size, 0);
            unitOfWork.addCommitment(createCommitment());
            assert.equal(unitOfWork.size, 1);
            unitOfWork.addCommitment(createCommitment());
            assert.equal(unitOfWork.size, 2);
        });
    });
    describe("#onAddedCommitment", () => {
        it("this handler should called when add new commitment", (done) => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            const newCommitment = createCommitment();
            unitOfWork.onAddedCommitment((commitment) => {
                assert.strictEqual(commitment, newCommitment, "added commitment");
                assert.strictEqual(commitment, newCommitment, "added commitment");
                done();
            });
            unitOfWork.addCommitment(newCommitment);
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
            unitOfWork.addCommitment(createCommitment());
            unitOfWork.commit();
            assert.strictEqual(unitOfWork.size, 0);
        });
        it("commitable should be committed by UnitOfWork", () => {
            const { mockStoreGroup, commitments } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            const commitmentA = createCommitment();
            const commitmentB = createCommitment();
            unitOfWork.addCommitment(commitmentA);
            unitOfWork.addCommitment(commitmentB);
            unitOfWork.commit();
            assert.deepStrictEqual(commitments, [commitmentA, commitmentB]);
        });
    });
    describe("#release", () => {
        it("released UnitOfWork can not commit", () => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            unitOfWork.addCommitment(createCommitment());
            unitOfWork.release();
            assert.strictEqual(unitOfWork.size, 0);
            assert.throws(() => {
                unitOfWork.commit();
            });
        });
    });
});
