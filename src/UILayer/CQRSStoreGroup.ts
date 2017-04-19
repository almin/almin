// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import MapLike from "map-like";
import { Payload } from "../payload/Payload";
import { Store, AnyStore } from "../Store";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";
import { ErrorPayload } from "../payload/ErrorPayload";
import { WillExecutedPayload } from "../payload/WillExecutedPayload";
import { DidExecutedPayload } from "../payload/DidExecutedPayload";
import { CompletedPayload } from "../payload/CompletedPayload";
import { shallowEqual } from "shallow-equal-object";
import { ChangedPayload } from "../payload/ChangedPayload";
import { Dispatcher } from "../Dispatcher";
const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";

export interface GroupState {
    // stateName: state
    [key: string]: any
}
// stateName: Store in constructor
export type MapStore<T> = {
    // assign T[P] to State
    [P in keyof T]: Store<T[P]>
};

export type MapState<T> = {
    // MapStore define T[P]
    // Now, T[P] is State
    [P in keyof T]: T[P]
};
// Internal Payload class
class InitializedPayload extends Payload {
    constructor() {
        super({ type: "Almin__InitializedPayload__" });
    }
}
// InitializedPayload for passing to Store if the state change is not related payload.
const initializedPayload = new InitializedPayload();
// ChangedPayload is for changing from Store.
const changedPayload = new ChangedPayload();

/**
 * assert: check arguments of constructor.
 */
const assertConstructorArguments = (arg: any): void | never => {
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
 * assert immutability of the `store`'s state
 * If the store call `Store#emitChange()` and the state of store is not changed, throw error.
 * https://github.com/almin/almin/issues/151
 */
const assertStateIsImmutable = (prevState: any, nextState: any, store: AnyStore, changingStores: Array<AnyStore>) => {
    const isChangingStore = changingStores.indexOf(store) !== -1;
    if (!isChangingStore) {
        return;
    }
    const isStateChangedAtLeastOne = Object.keys(nextState).some(key => {
        const prevStateValue = prevState[key];
        const nextStateValue = nextState[key];
        return prevStateValue !== nextStateValue;
    });
    if (!isStateChangedAtLeastOne) {
        console.warn(`Store(${store.name}) does call emitChange(). 
But, this store's state is not changed.
Store's state should be immutable value.
Prev State:`, prevState, `Next State:`, nextState
        );
    }
};
/**
 * CQRSStoreGroup support pull-based and push-based Store.
 *
 * ### Pull-based: Recompute every time value is needed
 *
 * Pull-based Store has only getState.
 * Just create the state and return it when `getState` is called.
 *
 * ```js
 * const initialState = new State();
 * class MyStore extends Store {
 *    getState({ myState: prevState = initialState }, payload) {
 *       return {
 *          myState: myState.reduce(payload); // return new State
 *       };
 *    }
 * }
 * ```
 *
 * ### Push-based: Recompute when a source value changes
 *
 * Push-based Store have to create the sate ans save it.
 * Just return the state when `getState` is called.
 * It is similar with cache system.
 *
 * ```js
 * class MyStore extends Store {
 *    constructor() {
 *      super();
 *      this.state = new State();
 *      this.onDispatch(payload => {
 *         this.state = this.state.reduce(payload);
 *      });
 *    }
 *
 *    getState() {
 *      return {
 *          myState: this.state
*       };
 *    }
 * }
 * ```
 */
export class CQRSStoreGroup<T> extends Dispatcher {
    name = "CQRSStoreGroup";
    // observing stores
    public stores: Array<AnyStore>;
    // current state
    protected state: MapState<T>;
    // stores that are emitted changed.
    private _emitChangedStores: Array<AnyStore> = [];
    // stores that are changed compared by previous state.
    private _changingStores: Array<AnyStore> = [];
    // all functions to release handlers
    private _releaseHandlers: Array<Function> = [];
    // already finished UseCase Map
    private _finishedUseCaseMap: MapLike<string, boolean>;
    // current working useCase
    private _workingUseCaseMap: MapLike<string, boolean>;
    // store/state cache map
    private _stateCacheMap: MapLike<AnyStore, any>;
    // store/state map
    private _preComputeStateNameByStoreMap: MapLike<AnyStore, string>;

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
    constructor(public stateStoreMapping: MapStore<T>) {
        super();
        if (process.env.NODE_ENV !== "production") {
            assertConstructorArguments(stateStoreMapping);
        }
        const stateNames = Object.keys(stateStoreMapping);
        // pull stores from mapping if arguments is mapping.
        this.stores = this.getStoresFromMapping(stateStoreMapping);
        this._preComputeStateNameByStoreMap = new MapLike<AnyStore, string>();
        this._workingUseCaseMap = new MapLike<string, boolean>();
        this._finishedUseCaseMap = new MapLike<string, boolean>();
        this._stateCacheMap = new MapLike<AnyStore, any>();
        // Implementation Note:
        // Dispatch -> pipe -> Store#emitChange() if it is needed
        //          -> this.onDispatch -> If anyone store is changed, this.emitChange()
        // each pipe to dispatching
        this.stores.forEach((store, index) => {
            // observe Store
            const registerHandler = this._registerStore(store);
            this._releaseHandlers.push(registerHandler);
            // delegate dispatching
            const pipeHandler = this.pipe(store);
            this._releaseHandlers.push(pipeHandler);
            // compute storeStateNameMap if it needed
            if (stateNames[index] !== undefined) {
                this._preComputeStateNameByStoreMap.set(store, stateNames[index]);
            }
        });
        // after dispatching, and then emitChange
        this._observeDispatchedPayload();
        // default state
        this.state = this.collectGroupState(this.stores, initializedPayload);
    }

    private getStoresFromMapping(storeStateMapping: MapStore<T>): Array<AnyStore> {
        return Object.keys(storeStateMapping).map(name => {
            return storeStateMapping[name];
        });
    }

    /**
     * If exist working UseCase, return true
     */
    protected get existWorkingUseCase() {
        return this._workingUseCaseMap.size > 0;
    }

    protected get isInitializedWithStateNameMap() {
        return this._preComputeStateNameByStoreMap.size > 0;
    }

    /**
     * Return the state object that merge each stores's state
     */
    getState(): MapState<T> {
        return this.state;
    }

    private collectGroupState(stores: Array<AnyStore>, payload: Payload): MapState<T> {
        // 1. write in read
        this.writePhaseInRead(stores, payload);
        // 2. read in read
        return this.readPhaseInRead(stores) as MapState<T>;
    }

    // write phase
    // Each store updates own state
    private writePhaseInRead(stores: Array<AnyStore>, payload: Payload): void {
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
    private readPhaseInRead(stores: Array<AnyStore>): GroupState {
        const groupState: GroupState = {};
        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            const prevState = this._stateCacheMap.get(store);
            const nextState = store.getState();
            // if the prev/next state is same, not update the state.
            const stateName = this._preComputeStateNameByStoreMap.get(store);
            if (process.env.NODE_ENV !== "production") {
                assertStateIsImmutable(prevState, nextState, store, this._emitChangedStores);
                assert.ok(stateName !== undefined, `Store:${store.name} is not registered in constructor.
But, ${store.name}#getState() was called.`);
            }
            // the state is not changed, set prevState as state of the store
            // Check shouldStateUpdate
            if (typeof store.shouldStateUpdate === "function") {
                if (!store.shouldStateUpdate(prevState, nextState)) {
                    groupState[stateName!] = prevState;
                    continue;
                }
            } else {
                if (prevState === nextState) {
                    groupState[stateName!] = prevState;
                    continue;
                }
            }
            // Update cache
            this._stateCacheMap.set(store, nextState);
            // Changing flag On
            this._addChangingStateOfStores(store);
            // Set state
            groupState[stateName!] = nextState;
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
    shouldStateUpdate(prevState: any, nextState: any): boolean {
        return !shallowEqual(prevState, nextState);
    }

    /**
     * Emit change if the state is changed.
     * If call with no-arguments, use ChangedPayload by default.
     */
    emitChange(payload: Payload = changedPayload): void {
        this._pruneChangingStateOfStores();
        const nextState = this.collectGroupState(this.stores, payload);
        if (!this.shouldStateUpdate(this.state, nextState)) {
            return;
        }
        this.state = nextState;
        // emit changes
        const changingStores = this._changingStores.slice();
        const changingStates = this._getStatesFromStores(changingStores);
        this.emit(CHANGE_STORE_GROUP, changingStores, changingStates);
        // release changed stores
        this._pruneEmitChangedStore();
    }

    /**
     * Observe changes of the store group.
     *
     * onChange workflow: https://code2flow.com/mHFviS
     */
    onChange(handler: (stores: Array<AnyStore>) => void): () => void {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
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

    private _getStatesFromStores(stores: Array<AnyStore>) {
        return stores.map(store => {
            return this._stateCacheMap.get(store);
        });
    }

    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     */
    private _registerStore(store: AnyStore): () => void {
        const onChangeHandler = () => {
            this.addEmitChangedStore(store);
            // if not exist working UseCases, immediate invoke emitChange.
            if (!this.existWorkingUseCase) {
                this.emitChange();
            }
        };
        if (process.env.NODE_ENV !== "production") {
            (onChangeHandler as any).displayName = `${store.name}#onChange->handler`;
        }
        return store.onChange(onChangeHandler);
    }

    /**
     * Observe all payload.
     */
    private _observeDispatchedPayload(): void {
        const observeChangeHandler = (payload: Payload, meta: DispatcherPayloadMeta) => {
            if (!meta.isTrusted) {
                this.emitChange(payload);
            } else if (payload instanceof ErrorPayload) {
                this.emitChange(payload);
            } else if (payload instanceof WillExecutedPayload && meta.useCase) {
                this._workingUseCaseMap.set(meta.useCase.id, true);
            } else if (payload instanceof DidExecutedPayload && meta.useCase) {
                if (meta.isUseCaseFinished) {
                    this._finishedUseCaseMap.set(meta.useCase.id, true);
                }
                this.emitChange(payload);
            } else if (payload instanceof CompletedPayload && meta.useCase && meta.isUseCaseFinished) {
                this._workingUseCaseMap.delete(meta.useCase.id);
                // if the useCase is already finished, doesn't emitChange in CompletedPayload
                // In other word, If the UseCase that return non-promise value, doesn't emitChange in CompletedPayload
                if (this._finishedUseCaseMap.has(meta.useCase.id)) {
                    this._finishedUseCaseMap.delete(meta.useCase.id);
                    return;
                }
                this.emitChange(payload);
            }
        };
        const releaseHandler = this.onDispatch(observeChangeHandler);
        this._releaseHandlers.push(releaseHandler);
    }

    private addEmitChangedStore(store: AnyStore) {
        if (this._emitChangedStores.indexOf(store) === -1) {
            this._emitChangedStores.push(store);
        }
    }

    private _pruneEmitChangedStore() {
        this._emitChangedStores = [];
    }

    private _addChangingStateOfStores(store: AnyStore) {
        if (this._changingStores.indexOf(store) === -1) {
            this._changingStores.push(store);
        }
    }

    private _pruneChangingStateOfStores() {
        this._changingStores = [];
    }

}
