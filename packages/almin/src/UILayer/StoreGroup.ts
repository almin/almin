// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { MapLike } from "map-like";
import { Payload } from "../payload/Payload";
import { DispatcherPayloadMeta, DispatcherPayloadMetaImpl } from "../DispatcherPayloadMeta";
import { isWillExecutedPayload } from "../payload/WillExecutedPayload";
import { isCompletedPayload } from "../payload/CompletedPayload";
import { shallowEqual } from "shallow-equal-object";
import { Dispatcher } from "../Dispatcher";
import { StateMap, StoreMap } from "./StoreGroupTypes";
import { createStoreStateMap, StoreStateMap } from "./StoreStateMap";
import { Store } from "../Store";
import { StoreGroupEmitChangeChecker } from "./StoreGroupEmitChangeChecker";
import { shouldStateUpdate } from "./StoreGroupUtils";
import { Commitment } from "../UnitOfWork/UnitOfWork";
import { InitializedPayload } from "../payload/InitializedPayload";
import { StoreGroupChangingStoreStrictChecker } from "./StoreGroupChangingStoreStrictChecker";
import { StoreGroupLike, StoreGroupReasonForChange } from "./StoreGroupLike";
import { isDidExecutedPayload } from "../payload/DidExecutedPayload";
import { isErrorPayload } from "../payload/ErrorPayload";
import { isTransactionBeganPayload } from "../payload/TransactionBeganPayload";
import { isTransactionEndedPayload } from "../payload/TransactionEndedPayload";

const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";

// { stateName: state }
export interface StoreGroupState {
    [key: string]: any;
}

/**
 * assert: check arguments of constructor.
 */
const assertConstructorArguments = (arg: any): void => {
    const message = `Should initialize this StoreGroup with a stateName-store mapping object.
const aStore = new AStore();
const bStore = new BStore();
// A arguments is stateName-store mapping object like { stateName: store }
const storeGroup = new StoreGroup({
    a: aStore,
    b: bStore
});
console.log(storeGroup.getState());
// { a: "a value", b: "b value" }
`;
    assert.ok(typeof arg === "object" && arg !== null && !Array.isArray(arg), message);
    const keys = Object.keys(arg);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = arg[key];
        // Don't checking for accepting string or symbol.
        // assert.ok(typeof key === "string", `key should be string type: ${key}: ${value}` + "\n" + message);
        assert.ok(Store.isStore(value), `value should be instance of Store: ${key}: ${value}` + "\n" + message);
    }
};

/**
 * StoreGroup is a parts of read-model.
 *
 * StoreGroup has separated two phase in a life-cycle.
 * These are called Write phase and Read phase.
 *
 * StoreGroup often does write phase and, then read phase.
 *
 * ## Write phase
 *
 * StoreGroup notify update timing for each stores.
 *
 * It means that call each `Store#receivePayload()`.
 *
 * ### When
 *
 * - Initialize StoreGroup
 * - A parts of life-cycle during execute UseCase
 * - Force update StoreGroup
 *
 * ### What does store?
 *
 * - Store update own state if needed
 *
 * ### What does not store?
 *
 * - Store should not directly assign to state instead of using `Store#setState`
 *
 * ## Read phase
 *
 * StoreGroup read the state from each stores.
 *
 * It means that call each `Store#getState()`.
 *
 * ### When
 *
 * - Initialize StoreGroup
 * - A parts of life-cycle during execute UseCase
 * - Force update StoreGroup
 * - Some store call `Store#emitChange`
 *
 * ### What does store?
 *
 * - Store return own state
 *
 * ### What does not store?
 *
 * - Does not update own state
 * - Please update own state in write phase
 *
 * ### Notes
 *
 * #### Pull-based: Recompute every time value is needed
 *
 * Pull-based Store has only getState.
 * Just create the state and return it when `getState` is called.
 *
 * #### Push-based: Recompute when a source value changes
 *
 * Push-based Store have to create the state and save it.
 * Just return the state when `getState` is called.
 * It is similar with cache system.
 *
 */
export class StoreGroup<T> extends Dispatcher implements StoreGroupLike {
    // observing stores
    public stores: Array<Store<T>>;
    // current state
    public state: StateMap<T>;
    // stores that are changed compared by previous state.
    private _changingStores: Array<Store<T>> = [];
    // all functions to release handlers
    private _releaseHandlers: Array<Function> = [];
    // current working useCase
    private _workingUseCaseMap: MapLike<string, boolean>;
    // manage finished usecase
    private _finishedUseCaseMap: MapLike<string, boolean>;
    // store/state cache map
    private _stateCacheMap: MapLike<Store<T>, any>;
    // store/state map
    private _storeStateMap: StoreStateMap;
    // is strict mode
    private isStrictMode = false;
    // is transaction working
    private isTransactionWorking = false;
    // checker
    private storeGroupEmitChangeChecker = new StoreGroupEmitChangeChecker();
    private storeGroupChangingStoreStrictChecker = new StoreGroupChangingStoreStrictChecker();

    /**
     * Initialize this StoreGroup with a stateName-store mapping object.
     *
     * The rule of initializing StoreGroup is that "define the state name of the store".
     *
     * ## Example
     *
     * Initialize with store-state mapping object.
     *
     * ```js
     * class AStore extends Store {
     *     getState() {
     *         return "a value";
     *     }
     * }
     * class BStore extends Store {
     *     getState() {
     *         return "b value";
     *     }
     * }
     * const aStore = new AStore();
     * const bStore = new BStore();
     * const storeGroup = new StoreGroup({
     *     a: aStore, // stateName: store
     *     b: bStore
     * });
     * console.log(storeGroup.getState());
     * // { a: "a value", b: "b value" }
     * ```
     */
    constructor(public stateStoreMapping: StoreMap<T>) {
        super();
        if (process.env.NODE_ENV !== "production") {
            assertConstructorArguments(stateStoreMapping);
        }
        this._storeStateMap = createStoreStateMap(stateStoreMapping);
        // pull stores from mapping if arguments is mapping.
        this.stores = this._storeStateMap.stores;
        this._workingUseCaseMap = new MapLike<string, boolean>();
        this._finishedUseCaseMap = new MapLike<string, boolean>();
        this._stateCacheMap = new MapLike<Store<T>, any>();
        // Implementation Note:
        // Dispatch -> pipe -> Store#emitChange() if it is needed
        //          -> this.onDispatch -> If anyone store is changed, this.emitChange()
        // each pipe to dispatching
        this.stores.forEach(store => {
            // observe Store
            const unRegisterHandler = this._registerStore(store);
            this._releaseHandlers.push(unRegisterHandler);
        });
        // default state
        this.state = this.initializeGroupState(this.stores);
    }

    /**
     * If exist working UseCase, return true
     */
    private get existWorkingUseCase() {
        return this._workingUseCaseMap.size > 0;
    }

    /**
     * Return the state object that merge each stores's state
     */
    getState(): StateMap<T> {
        return this.state;
    }

    private initializeGroupState(stores: Array<Store<T>>): StateMap<T> {
        // InitializedPayload for passing to Store if the state change is not related payload.
        const payload = new InitializedPayload();
        const meta = new DispatcherPayloadMetaImpl({
            // this dispatch payload generated by this UseCase
            useCase: undefined,
            // dispatcher is the UseCase
            dispatcher: this,
            // parent is the same with UseCase. because this useCase dispatch the payload
            parentUseCase: null,
            // the user create this payload
            isTrusted: true,
            // Always false because the payload is dispatched from this working useCase.
            isUseCaseFinished: false
        });
        // 1. write in read
        this.writePhaseInRead(stores, payload, meta);
        // 2. read in read
        return this.readPhaseInRead(stores);
    }

    // write phase
    // Each store updates own state
    private writePhaseInRead(stores: Array<Store<T>>, payload: Payload, meta: DispatcherPayloadMetaImpl): void {
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            if (process.env.NODE_ENV !== "production") {
                this.storeGroupChangingStoreStrictChecker.mark(store);
            }
            // In almost case, A store should implement `receivePayload` insteadof of using `Store#onDispatch`
            // Warning(strict mode): Manually catch some event like Repository#onChange in a Store,
            // It would be broken in transaction mode
            // `Store#onDispatch` receive only dispatched the Payload by `UseCase#dispatch` that is not trusted data.
            if (!meta.isTrusted) {
                store.dispatch(payload, meta);
            }
            // reduce state by prevSate with payload if it is implemented
            if (typeof store.receivePayload === "function") {
                store.receivePayload(payload);
            }
            if (process.env.NODE_ENV !== "production") {
                this.storeGroupChangingStoreStrictChecker.unMark(store);
            }
        }
    }

    // read phase
    // Get state from each store
    private readPhaseInRead(stores: Array<Store<T>>): StateMap<T> {
        const groupState: StoreGroupState = {};
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            const prevState = this._stateCacheMap.get(store);
            const nextState = store.getState();
            // if the prev/next state is same, not update the state.
            const stateName = this._storeStateMap.get(store);
            if (process.env.NODE_ENV !== "production") {
                assert.ok(
                    stateName !== undefined,
                    `Store:${store.name} is not registered in constructor.
But, ${store.name}#getState() was called.`
                );
                this.storeGroupEmitChangeChecker.warningIfStatePropertyIsModifiedDirectly(store, prevState, nextState);
                // nextState has confirmed and release the `store` from the checker
                this.storeGroupEmitChangeChecker.unMark(store);
            }
            // the state is not changed, set prevState as state of the store
            if (!shouldStateUpdate(store, prevState, nextState)) {
                groupState[stateName!] = prevState;
                continue;
            }
            // Update cache
            this._stateCacheMap.set(store, nextState);
            // Changing flag On
            this._addChangingStateOfStores(store);
            // Set state
            groupState[stateName!] = nextState;
        }
        return groupState as StateMap<T>;
    }

    /**
     * Use `shouldStateUpdate()` to let StoreGroup know if a event is not affected.
     * The default behavior is to emitChange on every life-cycle change,
     * and in the vast majority of cases you should rely on the default behavior.
     * Default behavior is shallow-equal prev/next state.
     *
     * ## Example
     *
     * If you want to use `Object.is` to equal states, overwrite following.
     *
     * ```js
     * shouldStateUpdate(prevState, nextState) {
     *    return !Object.is(prevState, nextState)
     * }
     * ```
     */
    shouldStateUpdate(prevState: any, nextState: any): boolean {
        return !shallowEqual(prevState, nextState);
    }

    /**
     * Emit change if the state is changed.
     * If call with no-arguments, use ChangedPayload by default.
     */
    emitChange(): void {
        this.emitChangeIfStateIsChange();
    }

    private tryToUpdateState(payload: Payload, meta: DispatcherPayloadMeta) {
        this.writePhaseInRead(this.stores, payload, meta);
        // StoreGroup soft lock `emitChange` in the transaction.
        if (!this.isTransactionWorking) {
            this.emitChangeIfStateIsChange(payload, meta);
        }
    }

    /**
     * **Internal**
     *
     * ## Implementation Notes:
     *
     * StoreGroup should be push-model.
     * Almin can control all transaction to StoreGroup.
     *
     * It means that StoreGroup doesn't use `this.onDispatch`.
     * It use `commit` insteadof receive data vis `this.onDispatch`.
     */
    commit(commitment: Commitment): void {
        const payload = commitment[0];
        const meta = commitment[1];
        if (isTransactionBeganPayload(payload)) {
            // TODO: lock emitChange
            this.isTransactionWorking = true;
        } else if (!meta.isTrusted) {
            this.tryToUpdateState(payload, meta);
        } else if (isErrorPayload(payload)) {
            this.tryToUpdateState(payload, meta);
        } else if (isWillExecutedPayload(payload) && meta.useCase) {
            this._workingUseCaseMap.set(meta.useCase.id, true);
        } else if (isDidExecutedPayload(payload) && meta.useCase) {
            if (meta.isUseCaseFinished) {
                this._finishedUseCaseMap.set(meta.useCase.id, true);
            }
            this.tryToUpdateState(payload, meta);
        } else if (isCompletedPayload(payload) && meta.useCase && meta.isUseCaseFinished) {
            // if the useCase is already finished, doesn't emitChange in CompletedPayload
            // In other word, If the UseCase that return non-promise value, doesn't emitChange in CompletedPayload
            if (this._finishedUseCaseMap.has(meta.useCase.id)) {
                this._finishedUseCaseMap.delete(meta.useCase.id);
                // clean up about this UseCase
                this._workingUseCaseMap.delete(meta.useCase.id);
                return;
            }
            // if the UseCase#execute has async behavior, try to update before actual completed
            this.tryToUpdateState(payload, meta);
            // Now, this UseCase actual finish
            this._workingUseCaseMap.delete(meta.useCase.id);
        } else if (isTransactionEndedPayload(payload)) {
            // TODO: unlock emitChange
            this.isTransactionWorking = false;
            // try to emitChange after finish the transaction
            this.emitChangeIfStateIsChange(payload, meta);
        }
    }

    useStrict() {
        this.isStrictMode = true;
    }

    // read -> emitChange if needed
    private emitChangeIfStateIsChange(payload?: Payload, meta?: DispatcherPayloadMeta): void {
        this._pruneChangingStateOfStores();
        const nextState = this.readPhaseInRead(this.stores);
        if (!this.shouldStateUpdate(this.state, nextState)) {
            return;
        }
        this.state = nextState;
        const changingStores = this._changingStores.slice();
        // the reason details of this change
        const details: StoreGroupReasonForChange | undefined =
            payload && meta
                ? {
                      payload,
                      meta
                  }
                : undefined;
        // emit changes
        this.emit(CHANGE_STORE_GROUP, changingStores, details);
    }

    /**
     * Observe changes of the store group.
     *
     * onChange workflow: https://code2flow.com/mHFviS
     */
    onChange(handler: (stores: Array<Store<T>>, details?: StoreGroupReasonForChange) => void): () => void {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = () => {
            this.removeListener(CHANGE_STORE_GROUP, handler);
        };
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * Release all events handler.
     * You can call this when no more call event handler
     */
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this._pruneChangingStateOfStores();
    }

    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     */
    private _registerStore(store: Store<T>): () => void {
        const onChangeHandler = () => {
            if (process.env.NODE_ENV !== "production") {
                const prevState = this._stateCacheMap.get(store);
                const nextState = store.getState();
                // mark `store` as `emitChange`ed store in a UseCase life-cycle
                this.storeGroupEmitChangeChecker.mark(store, prevState, nextState);
                if (this.isStrictMode) {
                    // warning if this store is not allowed update at the time
                    this.storeGroupChangingStoreStrictChecker.warningIfStoreIsNotAllowedUpdate(store);
                }
            }
            // if not exist working UseCases, immediate invoke emitChange.
            if (!this.existWorkingUseCase) {
                this.emitChangeIfStateIsChange();
            }
        };
        if (process.env.NODE_ENV !== "production") {
            (onChangeHandler as any).displayName = `${store.name}#onChange->handler`;
        }
        return store.onChange(onChangeHandler);
    }

    private _addChangingStateOfStores(store: Store<T>) {
        if (this._changingStores.indexOf(store) === -1) {
            this._changingStores.push(store);
        }
    }

    private _pruneChangingStateOfStores() {
        this._changingStores = [];
    }
}
