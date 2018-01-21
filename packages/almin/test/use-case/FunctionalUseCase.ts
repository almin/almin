// MIT © 2017 azu
"use strict";
import { FunctionalUseCaseContext } from "../../src";

export const functionalUseCase = (context: FunctionalUseCaseContext) => {
    return (type: string) => {
        context.dispatcher.dispatch({
            type
        });
    };
};
