# Integration Redux's middleware

**WIP**

Use [redux-logger](https://github.com/theaqua/redux-logger "redux-logger") with Almin.

- `applyMiddlewares(...<reduxMiddleWare>)`

```js
"use strict";
const applyMiddlewares = (...middlewares) => {
    return middlewareAPI => {
        const originalDispatch = middlewareAPI.dispatch.bind(middlewareAPI);
        const wrapMiddleware = middlewares.map(middleware => {
            return middleware(middlewareAPI);
        });
        // apply middleware order by fist
        const last = wrapMiddleware[wrapMiddleware.length - 1];
        const rest = wrapMiddleware.slice(0, -1);
        const roundDispatch = rest.reduceRight((oneMiddle, middleware) => {
            return middleware(oneMiddle);
        }, last);
        return roundDispatch(originalDispatch);
    };
};
export default applyMiddlewares;
```


```js
import AppStoreGroup from "./js/store/AppStoreGroup";
// context
import {Context, Dispatcher}  from "almin";
import applyMiddlewares from "./apply-middlewares";
const createLogger = require("redux-logger");
const logger = createLogger();
// instances
const dispatcher = new Dispatcher();
const appStoreGroup = AppStoreGroup.create();
// context connect dispatch with stores
const middleWareAPI = {
    getState(){
        return appStoreGroup.getState();
    },
    dispatch(action){
        dispatcher.dispatch(action);
    }
};
const dispatch = applyMiddlewares(logger)(middleWareAPI);
const wrapperDispatcher = {
    onDispatch(payload){
        return dispatcher.onDispatch(payload);
    },
    dispatch(action){
        dispatch(action);
    },
    pipe(toDispatcher){
        return dispatcher.pipe(toDispatcher);
    }
};
const appContext = new Context({
    dispatcher: wrapperDispatcher,
    store: appStoreGroup
});
```