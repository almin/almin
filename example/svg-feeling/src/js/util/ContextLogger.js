// LICENSE : MIT
"use strict";
export default class ContextLogger {
    static logDispatch(payload) {
        console.info(`Dispatch:${payload.type}`, payload);
    }

    /**
     * @param {Store[]} stores
     */
    static logOnChange(stores) {
        stores.forEach(state => {
            console.groupCollapsed(`Store:${state.name} is Changed`);
            console.info(state.getState());
            console.groupEnd()
        })
    }
}