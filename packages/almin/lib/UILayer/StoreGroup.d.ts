import { Payload } from "../payload/Payload";
import { Dispatcher } from "../Dispatcher";
import { StateMap, StoreMap } from "./StoreGroupTypes";
import { Store } from "../Store";
export interface StoreGroupState {
    [key: string]: any;
}
/**
 * Initialized Payload
 * This is exported for an unit testing.
 * DO NOT USE THIS in your application.
 */
export declare class InitializedPayload extends Payload {
    constructor();
}
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
export declare class StoreGroup<T> extends Dispatcher {
    stateStoreMapping: StoreMap<T>;
    stores: Array<Store<T>>;
    protected state: StateMap<T>;
    private _emitChangedStores;
    private _changingStores;
    private _releaseHandlers;
    private _finishedUseCaseMap;
    private _workingUseCaseMap;
    private _stateCacheMap;
    private _storeStateMap;
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
    constructor(stateStoreMapping: StoreMap<T>);
    /**
     * If exist working UseCase, return true
     */
    protected readonly existWorkingUseCase: boolean;
    protected readonly isInitializedWithStateNameMap: boolean;
    /**
     * Return the state object that merge each stores's state
     */
    getState(): StateMap<T>;
    private initializeGroupState(stores, payload);
    private writePhaseInRead(stores, payload);
    private readPhaseInRead(stores);
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
    shouldStateUpdate(prevState: any, nextState: any): boolean;
    /**
     * Emit change if the state is changed.
     * If call with no-arguments, use ChangedPayload by default.
     */
    emitChange(): void;
    private sendPayloadAndTryEmit(payload);
    private tryEmitChange();
    /**
     * Observe changes of the store group.
     *
     * onChange workflow: https://code2flow.com/mHFviS
     */
    onChange(handler: (stores: Array<Store<T>>) => void): () => void;
    /**
     * Release all events handler.
     * You can call this when no more call event handler
     */
    release(): void;
    /**
     * register store and listen onChange.
     * If you release store, and do call `release` method.
     */
    private _registerStore(store);
    /**
     * Observe all payload.
     */
    private _observeDispatchedPayload();
    private addEmitChangedStore(store);
    private _pruneEmitChangedStore();
    private _addChangingStateOfStores(store);
    private _pruneChangingStateOfStores();
}
