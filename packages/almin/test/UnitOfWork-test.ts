// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { DispatcherPayloadMetaImpl } from "../src/DispatcherPayloadMeta";
import { Commitment, UnitOfWork } from "../src/UnitOfWork/UnitOfWork";

const createMockStoreGroup = () => {
    const commitments: Commitment[] = [];
    return {
        commitments,
        mockStoreGroup: {
            commit(commitment: Commitment) {
                commitments.push(commitment);
            }
        }
    };
};
let commitmentId = 0;
const createCommitment = (): Commitment => {
    const commitId = commitmentId++;
    return {
        payload: { type: `Example ${commitId}` },
        meta: new DispatcherPayloadMetaImpl({
            isTrusted: true
        }),
        debugId: String(commitmentId)
    };
};
describe("UnitOfWork", () => {
    describe("id", () => {
        it("should create new id ", () => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork_1 = new UnitOfWork(mockStoreGroup);
            const unitOfWork_2 = new UnitOfWork(mockStoreGroup);
            const unitOfWork_3 = new UnitOfWork(mockStoreGroup);
            assert.notStrictEqual(unitOfWork_1.id, unitOfWork_2.id);
            assert.notStrictEqual(unitOfWork_1.id, unitOfWork_3.id);
            assert.notStrictEqual(unitOfWork_2.id, unitOfWork_3.id);
        });
    });
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
        it("this handler should called when add new commitment", done => {
            const { mockStoreGroup } = createMockStoreGroup();
            const unitOfWork = new UnitOfWork(mockStoreGroup);
            const newCommitment = createCommitment();
            unitOfWork.onAddedCommitment(commitment => {
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
            assert.deepEqual(commitments, [commitmentA, commitmentB]);
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
