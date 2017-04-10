// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import MapLike from "map-like";
import { Payload } from "../payload/Payload";
import { Store } from "../Store";
import { DispatcherPayloadMeta } from "../DispatcherPayloadMeta";
import { ErrorPayload } from "../payload/ErrorPayload";
import { WillExecutedPayload } from "../payload/WillExecutedPayload";
import { DidExecutedPayload } from "../payload/DidExecutedPayload";
import { CompletedPayload } from "../payload/CompletedPayload";
import { shallowEqual } from "shallow-equal-object";
import { ChangedPayload } from "../payload/ChangedPayload";
const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";
export interface StateStoreMapping {
    // stateName: Store
    [key: string]: Store
}
// Internal Payload class
class InitializedPayload extends Payload {
    constructor() {
        super({ type: "Almin__InitializedPayload__" });
    }
}
// Empty state for passing to Store if previous state is empty.
const emptyStateOfStore = Object.freeze({});
// InitializedPayload for passing to Store if the state change is not related payload.
const initializedPayload = new InitializedPayload();
// ChangedPayload is for changing from Store.
const changedPayload = new ChangedPayload();
/**
 * assert `state` shape.
 * `state` should be object if not found in StoreStateNameMap
 */
const assertStateShape = (state: any, store: Store, stateNameMap: MapLike<Store, string>): void => {
    const isObjectState = typeof state == "object";
    if (!isObjectState && stateNameMap.has(store)) {
        return;
    }
    assert.ok(isObjectState, `${store}: ${store.name}.getState() should return Object.

A Store return a state object.

 class ExampleStore extends Store {
     getState(prevState) {
         return {
            stateName: state
         };
     }
 }
 
Or, A Store return a state value and initialize StoreGroup with state name mapping.


 class ExampleStore extends Store {
     getState(prevState) {
         return state;
     }
 }

 const exampleStore = new ExampleStore();
 const storeGroup = new StoreGroup({
     stateName: exampleStore
 }):
 
Then, use can access by stateName.

StoreGroup#getState()["stateName"]; // state

`);
    assert.ok(Object.keys(state).length === 1, `${store}: ${store.name}.getState() should return Object that has a single state.
${store.name}.getState() return a Object, but the object has multiple keys.

Bad:

 class ExampleStore extends Store {
     getState(prevState) {
         return {
            a1: state,
            a2: state
         };
     }
 }


Good:

 class ExampleStore extends Store {
     getState(prevState) {
         return {
            stateName: state
         };
     }
 }
 
Then, use can access by stateName.

StoreGroup#getState()["stateName"]; // state

`);
};
/**
 * assert immutability of the `store`'s state
 * If the store call `Store#emitChange()` and the state of store is not changed, throw error.
 * https://github.com/almin/almin/issues/151
 */
const assertStateIsImmutable = (prevState: any, nextState: any, store: Store, changingStores: Array<Store>) => {
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
// Assert:
function assertStoreIsRegister(store: Store,
                               stateNameByStoreMap: MapLike<Store, string>,
                               isInitializeWithStateNameMapping: boolean) {
    if (!isInitializeWithStateNameMapping) {
        return;
    }
    assert.ok(stateNameByStoreMap.has(store), `Store:${store.name} is not registered in constructor.
But,it was called ${store.name}#getState().
`)
}
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
export class CQRSStoreGroup extends Store {
    // observing stores
    public stores: Array<Store>;
    // current state
    protected state: any;
    // stores that are emitted changed.
    private _emitChangedStores: Array<Store> = [];
    // stores that are changed compared by previous state.
    private _changingStores: Array<Store> = [];
    // all functions to release handlers
    private _releaseHandlers: Array<Function> = [];
    // already finished UseCase Map
    private _finishedUseCaseMap: MapLike<string, boolean>;
    // current working useCase
    private _workingUseCaseMap: MapLike<string, boolean>;
    // store/state cache map
    private _stateCacheMap: MapLike<Store, any>;
    // store/state map
    private _stateNameByStoreMap: MapLike<Store, string>;

    /**
     * Initialize this StoreGroup with an array of Store OR a stateName-store mapping object.
     *
     * The rule of initializing StoreGroup is that "define the state name of the store".
     *
     * This StoreGroup provide two way. But, these can't be mixed.
     *
     * ## Example
     *
     * Initialize with an array of Store.
     *
     * ```js
     * class AStore extends Store {
     *   getState() {
     *     return {
     *       a: "a value"
     *     };
     *   }
     * }
     * class BStore extends Store {
     *   getState() {
     *     return {
     *       b: "b value"
     *     };
     *   }
     * }
     * const aStore = new AStore();
     * const bStore = new BStore();
     * const storeGroup = new CQRSStoreGroup([
     *     aStore,
     *     bStore
     * ]);
     * console.log(storeGroup.getState());
     * // { a: "a value", b: "b value" }
     * ```
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
    constructor(stores: Array<Store> | StateStoreMapping) {
        super();
        const stateNames = Array.isArray(stores) ? [] : Object.keys(stores);
        // pull stores from mapping if arguments is mapping.
        this.stores = Array.isArray(stores) ? stores : this.getStoresFromMapping(stores);
        this._stateNameByStoreMap = new MapLike<Store, string>();
        this._workingUseCaseMap = new MapLike<string, boolean>();
        this._finishedUseCaseMap = new MapLike<string, boolean>();
        this._stateCacheMap = new MapLike<Store, any>();
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
                this._stateNameByStoreMap.set(store, stateNames[index]);
            }
        });
        // after dispatching, and then emitChange
        this._observeDispatchedPayload();
        // default state
        this.state = this.collectState(initializedPayload);
    }

    private getStoresFromMapping(storeStateMapping: StateStoreMapping): Array<Store> {
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
        return this._stateNameByStoreMap.size > 0;
    }

    /**
     * Return the state object that merge each stores's state
     */
    getState<T>(): T {
        return this.state as T;
    }

    // actually getState
    private collectState<T>(payload: Payload): T {
        const mapStateOfStore = (store: Store) => {
            // 1. get prev or empty object
            const prevState = this._stateCacheMap.get(store) || emptyStateOfStore;
            const nextState = store.getState<typeof prevState>(prevState, payload);
            if (process.env.NODE_ENV !== "production") {
                assertStoreIsRegister(store, this._stateNameByStoreMap, this.isInitializedWithStateNameMap);
                assertStateShape(nextState, store, this._stateNameByStoreMap);
                assertStateIsImmutable(prevState, nextState, store, this._emitChangedStores);
            }
            // if the prev/next state is same, not update the state.
            if (!store.shouldStateUpdate(prevState, nextState)) {
                return prevState;
            }
            // 2. update prev state. It means that update the state of the store
            this._stateCacheMap.set(store, nextState);
            // if exist stateName in the map, use it as state name.
            // It aim to support dictionary state name initialization.
            const stateName = this._stateNameByStoreMap.get(store);
            if (stateName !== undefined) {
                return {
                    [stateName]: nextState
                };
            }
            this._addChangingStateOfStores(store);
            return nextState;
        };
        const stateMap = this.stores.map(mapStateOfStore);
        return Object.assign({}, ...stateMap);
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
        const nextState = this.collectState(payload);
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
    onChange(handler: (stores: Array<Store>) => void): () => void {
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
        this.state = {};
        this._pruneChangingStateOfStores();
    }

    private _getStatesFromStores(stores: Array<Store>) {
        return stores.map(store => {
            return this._stateCacheMap.get(store);
        });
    }

    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     */
    private _registerStore(store: Store): () => void {
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

    private addEmitChangedStore(store: Store) {
        this._emitChangedStores.push(store);
    }

    private _pruneEmitChangedStore() {
        this._emitChangedStores = [];
    }

    private _addChangingStateOfStores(store: Store) {
        this._changingStores.push(store);
    }

    private _pruneChangingStateOfStores() {
        this._changingStores = [];
    }

}
