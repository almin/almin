// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";
export interface UseCaseLike extends Dispatcher {
    id: string;
    name: string;
    shouldExecute?(...args: Array<any>): boolean;
    execute(...args: Array<any>): any;
    throwError(error: Error): void;
}
