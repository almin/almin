// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
import { StoreLike } from "./StoreLike";
import { shallowEqual } from "shallow-equal-object";
import { Payload } from "./payload/Payload";

const STATE_CHANGE_EVENT = "STATE_CHANGE_EVENT";

/**
 * @type {string}
 * @private
 */
export const defaultStoreName = "<Anonymous-Store>";
/**
 * Store hold the state of your application.
 *
 * Typically, `Store` has a parts of the whole state tree of your application.
 * `StoreGroup` is the the whole state tree.
 *
 * It means that `StoreGroup` is a collection of `Store` instances.
 *
 * A UseCase `dispatch(payload)` and `Store` can receive it.
 *
 * ### Abstraction Code
 *
 * This is imagination code. (It will not work.)
 *
 * ```js
 * abcUseCase
 *  .dispatch({
 *      type: "ABC",
 *      value: "value"
 *  });
 *
 * abcStore
 *  .onDispatch(({ type, value }) => {
 *      console.log(type);  // "ABC"
 *      console.log(value); // 42
 *  });
 * ```
 *
 * ### Example
 *
 * To implement store, you have to inherit `Store` class.
 *
 * ```js
 * class YourStore extends Store {
 *    constructor(){
 *       super();
 *       this.state = {
 *          foo : "bar"
 *       };
 *    }
 *    getState(){
 *      return {
 *          yourStore: this.state
 *      };
 *    }
 * }
 * ```
 */
export abstract class Store extends Dispatcher implements StoreLike {
    /**
     * Set debuggable name if needed.
     */
    static displayName?: string;

    /**
     * Return true if the `v` is store like.
     */
    static isStore(v: any): v is Store {
        if (v instanceof Store) {
            return true;
        } else if (typeof v === "object" && typeof v.getState === "function" && v.onChange === "function") {
            return true;
        }
        return false;
    }

    /**
     * The name of the Store.
     */
    name: string;

    /**
     * Constructor not have arguments.
     */
    constructor() {
        super();
        const own = this.constructor as typeof Store;
        /**
         * @type {string} Store name
         */
        this.name = own.displayName || own.name || defaultStoreName;
    }

    /**
     * ## Write phase in read-side
     *
     * You can update own state.
     */
    receivePayload?(payload: Payload): void;

    /**
     * If the prev/next state is difference, should return true.
     */
    shouldStateUpdate<T>(prevState: T, nextState: T): boolean {
        return !shallowEqual(prevState, nextState);
    }

    /**
     * ## Read-phase in read-side
     *
     * You should be overwrite by Store subclass.
     * Next, return state object of your store.
     */
    abstract getState<T>(prevState?: T): T;

    /**
     * Subscribe change event of the store.
     * When `Store#emitChange()` is called, then call subscribers.
     *
     * ### Example
     *
     * ```js
     * store.onChange((changingStores) => {
     *    console.log(changingStores); // [store]
     * });
     *
     * store.emitChange();
     * ```
     */
    onChange(cb: (changingStores: Array<StoreLike>) => void): () => void {
        this.on(STATE_CHANGE_EVENT, cb);
        return this.removeListener.bind(this, STATE_CHANGE_EVENT, cb);
    }

    /**
     * Emit "change" event to subscribers.
     * If you want to notify changing ot tha store, call `Store#emitChange()`.
     */
    emitChange(): void {
        this.emit(STATE_CHANGE_EVENT, [this]);
    }
}

// Implement assertion
Store.prototype.getState = function (this: Store) {
    throw new Error(`${this.name} should be implemented Store#getState(): Object`);
};
