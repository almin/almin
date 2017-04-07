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
const CHANGE_STORE_GROUP = "CHANGE_STORE_GROUP";

class EmptyPayload extends Payload {
    constructor() {
        super({ type: "__Almin_EmptyPayload__" });
    }
}
const emptyPayload = new EmptyPayload();
const InitialState = {};
/**
 * onChange flow
 * https://code2flow.com/UOdnfN
 */
export class CQRSStoreGroup extends Store {
    // current state
    public state: any;
    // observing stores
    public stores: Array<Store>;
    // current changing stores for emitChange
    public changingStores: Array<Store> = [];
    // all functions to release handlers
    private _releaseHandlers: Array<Function> = [];
    // already finished UseCase Map
    private _finishedUseCaseMap: MapLike<string, boolean>;
    // current working useCase
    private _workingUseCaseMap: MapLike<string, boolean>;
    // store/state cache map
    private _stateCacheMap: MapLike<Store, any>;

    constructor(stores: Array<Store>) {
        super();
        this.stores = stores;
        this._workingUseCaseMap = new MapLike<string, boolean>();
        this._finishedUseCaseMap = new MapLike<string, boolean>();
        this._stateCacheMap = new MapLike<Store, any>();
        // Implementation Note:
        // Dispatch -> pipe -> Store#emitChange() if it is needed
        //          -> this.onDispatch -> If anyone store is changed, this.emitChange()
        // each pipe to dispatching
        stores.forEach(store => {
            this._registerStore(store);
            // delegate dispatching
            const pipeHandler = this.pipe(store);
            this._releaseHandlers.push(pipeHandler);
        });
        // after dispatching, and then emitChange
        this._startObservePayload();
        // default state
        this.state = InitialState;
    }

    /**
     * if exist working UseCase, return true
     * @returns {boolean}
     */
    get existWorkingUseCase() {
        return this._workingUseCaseMap.size > 0;
    }

    /**
     * return the state object that merge each stores's state
     * @returns {Object} merged state object
     * @public
     */
    getState<T>(): T {
        if (this.state === InitialState) {
            this.state = this.collectState<T>(emptyPayload);
            return this.state;
        }
        return this.state as T;
    }

    // actually getState
    private collectState<T>(payload: Payload): T {
        const mapStateOfStore = (store: Store) => {
            // 1. get prev or empty object
            const prevState = this._stateCacheMap.get(store) || {};
            const nextState = store.getState<typeof prevState>(prevState, payload);
            if (process.env.NODE_ENV !== "production") {
                assert.ok(typeof nextState == "object", `${store}: ${store.name}.getState() should return Object.
e.g.)

 class ExampleStore extends Store {
     getState(prevState) {
         return {
            StateName: state
         };
     }
 }
 
Then, use can access by StateName.

StoreGroup#getState()["StateName"]; // state

`);
                // Check immutability of Store'state
                // https://github.com/almin/almin/issues/151
                const isChangingStore = this.changingStores.indexOf(store) !== -1;
                if (isChangingStore) {
                    const isStateChangedAtLeastOne = Object.keys(nextState).some(key => {
                        const prevStateValue = this.state[key];
                        const nextStateValue = nextState[key];
                        return prevStateValue !== nextStateValue;
                    });
                    assert.ok(isStateChangedAtLeastOne, `Store(${store.name}) called emitChange(). 
But, this store's state is not changed.
Store's state should be immutable value.`);
                }
            }
            // if the prev/next state is same, not update the state.
            if (!store.shouldStateUpdate(prevState, nextState)) {
                return prevState;
            }
            // 2. update prev state. It means that update the state of the store
            this._stateCacheMap.set(store, nextState);
            return nextState;
        };
        const stateMap = this.stores.map(mapStateOfStore);
        return Object.assign({}, ...stateMap);
    }

    /**
     * Use `shouldStoreChange()` to let StoreGroup know if a event is not affected.
     * The default behavior is to emitChange on every life-cycle change,
     * and in the vast majority of cases you should rely on the default behavior.
     *
     * ## Example
     *
     * If you want to emitChange when actually changingStore that called `Store#emitChange` is larger than 0.
     *
     * ```js
     * shouldStoreChange(nextState) {
     *    return changingStores.length > 0;
     * }
     * ```
     */
    shouldStoreGroupUpdate(nextState: any): boolean {
        // if anyone state value is changed, return true
        return Object.keys(this.state).some(stateName => {
            const prevStateValue = this.state[stateName];
            const nextStateValue = nextState[stateName];
            return prevStateValue !== nextStateValue;
        });
    }

    /**
     * emit change event
     * @public
     */
    emitChange(payload: Payload = emptyPayload): void {
        const nextState = this.collectState(payload);
        if (this.shouldStoreGroupUpdate(nextState)) {
            this.state = nextState;
            this.emit(CHANGE_STORE_GROUP, this.changingStores.slice());
            this._pruneChangingStores();
        }
    }

    /**
     * listen changes of the store group.
     * @param {function(stores: Store[])} handler the callback arguments is array of changed store.
     * @returns {Function} call the function and release handler
     * @public
     */
    onChange(handler: (stores: Array<Store>) => void): () => void {
        this.on(CHANGE_STORE_GROUP, handler);
        const releaseHandler = this.removeListener.bind(this, CHANGE_STORE_GROUP, handler);
        this._releaseHandlers.push(releaseHandler);
        return releaseHandler;
    }

    /**
     * release all events handler.
     * You can call this when no more call event handler
     * @public
     */
    release(): void {
        this._releaseHandlers.forEach(releaseHandler => releaseHandler());
        this._releaseHandlers.length = 0;
        this.state = null;
        this._pruneChangingStores();
    }

    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     * @param {Store} store
     * @private
     */
    private _registerStore(store: Store): void {
        const releaseOnChangeHandler = store.onChange(() => {
            this._addChangingStore(store);
            // if not exist working UseCases, immediate invoke emitChange.
            if (!this.existWorkingUseCase) {
                this.emitChange();
            }
        });
        // add release handler
        this._releaseHandlers.push(releaseOnChangeHandler);
    }

    // register changed events
    /* Edge case

    execute(){
        model.count = 1;
        saveToRepository(model);
        // DidExecute -> refresh
        return Promise.resolve().then(() => {
            model.count = 2;
            saveToRepository(model)
        }); // Complete -> refresh
    }

     */
    private _startObservePayload(): void {
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
                this.emitChange(payload); // MayBe
            } else if (payload instanceof CompletedPayload && meta.useCase && meta.isUseCaseFinished) {
                this._workingUseCaseMap.delete(meta.useCase.id);
                // if the useCase is already finished, doesn't emitChange in CompletedPayload
                if (this._finishedUseCaseMap.has(meta.useCase.id)) {
                    this._finishedUseCaseMap.delete(meta.useCase.id);
                    return;
                }
                this.emitChange(payload); // MayBe
            }
        };
        const releaseHandler = this.onDispatch(observeChangeHandler);
        this._releaseHandlers.push(releaseHandler);
    }

    private _addChangingStore(store: Store) {
        this.changingStores.push(store);
    }

    private _pruneChangingStores() {
        this.changingStores = [];
    }

}
