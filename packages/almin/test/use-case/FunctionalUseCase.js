// MIT © 2017 azu
"use strict";
export const functionalUseCase = context => {
    return type => {
        context.dispatcher.dispatch({
            type
        });
    };
};
