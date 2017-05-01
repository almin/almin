// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import MapLike from "map-like";
import { Payload } from "../payload/Payload";
import { ErrorPayload } from "../payload/ErrorPayload";
import { WillExecutedPayload } from "../payload/WillExecutedPayload";
import { DidExecutedPayload } from "../payload/DidExecutedPayload";
import { CompletedPayload } from "../payload/CompletedPayload";
import { shallowEqual } from "shallow-equal-object";
import { Dispatcher } from "../Dispatcher";
import { createStoreStateMap } from "./StoreStateMap";
import { Store } from "../Store";
const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";
/**
 * Initialized Payload
 * This is exported for an unit testing.
 * DO NOT USE THIS in your application.
 */
export class InitializedPayload extends Payload {
    constructor() {
        super({ type: "Almin__InitializedPayload__" });
    }
}
// InitializedPayload for passing to Store if the state change is not related payload.
const initializedPayload = new InitializedPayload();
/**
 * assert: check arguments of constructor.
 */
const assertConstructorArguments = (arg) => {
    const message = `Should initialize this StoreGroup with a stateName-store mapping object.
const aStore = new AStore();
const bStore = new BStore();
// A arguments is stateName-store mapping object like { stateName: store }
const storeGroup = new CQRSStoreGroup({
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
 * warning: check immutability of the `store`'s state
 * If the store call `Store#emitChange()` and the state of store is not changed, throw error.
 * https://github.com/almin/almin/issues/151
 */
const warningStateIsImmutable = (prevState, nextState, store, changingStores) => {
    const shouldStateUpdate = (prevState, nextState) => {
        if (typeof store.shouldStateUpdate === "function") {
            return store.shouldStateUpdate(prevState, nextState);
        }
        return prevState !== nextState;
    };
    // If the store emitChange, check immutability
    const isChangingStore = changingStores.indexOf(store) !== -1;
    if (isChangingStore) {
        const isStateChanged = shouldStateUpdate(prevState, nextState);
        if (!isStateChanged) {
            console.warn(`Store(${store.name}) does call emitChange(). 
But, this store's state is not changed.
Store's state should be immutable value.
Prev State:`, prevState, `Next State:`, nextState);
        }
    }
    // If the store return **changed** state, but shouldStateUpdate return false.
    // This checker aim to find updating that is not reflected to UI.
    if (!store.hasOwnProperty("state")) {
        return;
    }
    // store.state is not same with getState value
    // It means `store.state` is not related with getState
    if (store.state !== nextState) {
        return;
    }
    const isStatePropertyChanged = prevState !== nextState;
    const isStateChangedButShouldNotUpdate = isStatePropertyChanged && !shouldStateUpdate(prevState, nextState);
    if (isStateChangedButShouldNotUpdate) {
        console.warn(`${store.name}#state property is changed, but this change does not reflect to view.
Because, ${store.name}#shouldStateUpdate(prevState, store.state) has returned **false**.
It means that the variance is present between store's state and shouldStateUpdate.
You should update the state vis \`Store#setState\` method.

For example, you should update the state by following:

    this.setState(newState);
    
    // OR

    if(this.shouldStateUpdate(this.state, newState)){
        this.state = newState;
    }
`, "prevState", prevState, "nextState", nextState);
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
export class StoreGroup extends Dispatcher {
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
     * const storeGroup = new CQRSStoreGroup({
     *     a: aStore, // stateName: store
     *     b: bStore
     * });
     * console.log(storeGroup.getState());
     * // { a: "a value", b: "b value" }
     * ```
     */
    constructor(stateStoreMapping) {
        super();
        this.stateStoreMapping = stateStoreMapping;
        // stores that are emitted changed.
        this._emitChangedStores = [];
        // stores that are changed compared by previous state.
        this._changingStores = [];
        // all functions to release handlers
        this._releaseHandlers = [];
        if (process.env.NODE_ENV !== "production") {
            assertConstructorArguments(stateStoreMapping);
        }
        this._storeStateMap = createStoreStateMap(stateStoreMapping);
        // pull stores from mapping if arguments is mapping.
        this.stores = this._storeStateMap.stores;
        this._workingUseCaseMap = new MapLike();
        this._finishedUseCaseMap = new MapLike();
        this._stateCacheMap = new MapLike();
        // Implementation Note:
        // Dispatch -> pipe -> Store#emitChange() if it is needed
        //          -> this.onDispatch -> If anyone store is changed, this.emitChange()
        // each pipe to dispatching
        this.stores.forEach((store) => {
            // observe Store
            const registerHandler = this._registerStore(store);
            this._releaseHandlers.push(registerHandler);
            // delegate dispatching
            const pipeHandler = this.pipe(store);
            this._releaseHandlers.push(pipeHandler);
        });
        // after dispatching, and then emitChange
        this._observeDispatchedPayload();
        // default state
        this.state = this.initializeGroupState(this.stores, initializedPayload);
    }
    /**
     * If exist working UseCase, return true
     */
    get existWorkingUseCase() {
        return this._workingUseCaseMap.size > 0;
    }
    get isInitializedWithStateNameMap() {
        return this._storeStateMap.size > 0;
    }
    /**
     * Return the state object that merge each stores's state
     */
    getState() {
        return this.state;
    }
    initializeGroupState(stores, payload) {
        // 1. write in read
        this.writePhaseInRead(stores, payload);
        // 2. read in read
        return this.readPhaseInRead(stores);
    }
    // write phase
    // Each store updates own state
    writePhaseInRead(stores, payload) {
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            // reduce state by prevSate with payload if it is implemented
            if (typeof store.receivePayload === "function") {
                store.receivePayload(payload);
            }
        }
    }
    // read phase
    // Get state from each store
    readPhaseInRead(stores) {
        const groupState = {};
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            const prevState = this._stateCacheMap.get(store);
            const nextState = store.getState();
            // if the prev/next state is same, not update the state.
            const stateName = this._storeStateMap.get(store);
            if (process.env.NODE_ENV !== "production") {
                assert.ok(stateName !== undefined, `Store:${store.name} is not registered in constructor.
But, ${store.name}#getState() was called.`);
                warningStateIsImmutable(prevState, nextState, store, this._emitChangedStores);
            }
            // the state is not changed, set prevState as state of the store
            // Check shouldStateUpdate
            if (typeof store.shouldStateUpdate === "function") {
                if (!store.shouldStateUpdate(prevState, nextState)) {
                    groupState[stateName] = prevState;
                    continue;
                }
            }
            else {
                if (prevState === nextState) {
                    groupState[stateName] = prevState;
                    continue;
                }
            }
            // Update cache
            this._stateCacheMap.set(store, nextState);
            // Changing flag On
            this._addChangingStateOfStores(store);
            // Set state
            groupState[stateName] = nextState;
        }
        return groupState;
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
    shouldStateUpdate(prevState, nextState) {
        return !shallowEqual(prevState, nextState);
    }
    /**
     * Emit change if the state is changed.
     * If call with no-arguments, use ChangedPayload by default.
     */
    emitChange() {
        this.tryEmitChange();
    }
    // write and read -> emitChange if needed
    sendPayloadAndTryEmit(payload) {
        this.writePhaseInRead(this.stores, payload);
        this.tryEmitChange();
    }
    // read -> emitChange if needed
    tryEmitChange() {
        this._pruneChangingStateOfStores();
        const nextState = this.readPhaseInRead(this.stores);
        if (!this.shouldStateUpdate(this.state, nextState)) {
            return;
        }
        this.state = nextState;
        // emit changes
        const changingStores = this._changingStores.slice();
        this.emit(CHANGE_STORE_GROUP, changingStores);
        // release changed stores
        this._pruneEmitChangedStore();
    }
    /**
     * Observe changes of the store group.
     *
     * onChange workflow: https://code2flow.com/mHFviS
     */
    onChange(handler) {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }
    /**
     * Release all events handler.
     * You can call this when no more call event handler
     */
    release() {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this._pruneChangingStateOfStores();
    }
    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     */
    _registerStore(store) {
        const onChangeHandler = () => {
            this.addEmitChangedStore(store);
            // if not exist working UseCases, immediate invoke emitChange.
            if (!this.existWorkingUseCase) {
                this.tryEmitChange();
            }
        };
        if (process.env.NODE_ENV !== "production") {
            onChangeHandler.displayName = `${store.name}#onChange->handler`;
        }
        return store.onChange(onChangeHandler);
    }
    /**
     * Observe all payload.
     */
    _observeDispatchedPayload() {
        const observeChangeHandler = (payload, meta) => {
            if (!meta.isTrusted) {
                this.sendPayloadAndTryEmit(payload);
            }
            else if (payload instanceof ErrorPayload) {
                this.sendPayloadAndTryEmit(payload);
            }
            else if (payload instanceof WillExecutedPayload && meta.useCase) {
                this._workingUseCaseMap.set(meta.useCase.id, true);
            }
            else if (payload instanceof DidExecutedPayload && meta.useCase) {
                if (meta.isUseCaseFinished) {
                    this._finishedUseCaseMap.set(meta.useCase.id, true);
                }
                this.sendPayloadAndTryEmit(payload);
            }
            else if (payload instanceof CompletedPayload && meta.useCase && meta.isUseCaseFinished) {
                this._workingUseCaseMap.delete(meta.useCase.id);
                // if the useCase is already finished, doesn't emitChange in CompletedPayload
                // In other word, If the UseCase that return non-promise value, doesn't emitChange in CompletedPayload
                if (this._finishedUseCaseMap.has(meta.useCase.id)) {
                    this._finishedUseCaseMap.delete(meta.useCase.id);
                    return;
                }
                this.sendPayloadAndTryEmit(payload);
            }
        };
        const releaseHandler = this.onDispatch(observeChangeHandler);
        this._releaseHandlers.push(releaseHandler);
    }
    addEmitChangedStore(store) {
        if (this._emitChangedStores.indexOf(store) === -1) {
            this._emitChangedStores.push(store);
        }
    }
    _pruneEmitChangedStore() {
        this._emitChangedStores = [];
    }
    _addChangingStateOfStores(store) {
        if (this._changingStores.indexOf(store) === -1) {
            this._changingStores.push(store);
        }
    }
    _pruneChangingStateOfStores() {
        this._changingStores = [];
    }
}
