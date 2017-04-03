// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
export interface UseCaseLike extends Dispatcher {
    id: string;
    name: string;
    execute(...args: Array<any>): any;
    throwError(error: Error): void;
}

