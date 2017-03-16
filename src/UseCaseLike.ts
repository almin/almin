// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
export interface UseCaseLike extends Dispatcher {
    name: string;
    execute<R>(...args: Array<any>): R;
    throwError(error: Error): void;
}

