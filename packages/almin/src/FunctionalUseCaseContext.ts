// LICENSE : MIT
"use strict";
import { Dispatcher } from "./Dispatcher";

/**
 * ```js
 * const useCase = (context) => {
 *   return () => {
 *      // execute
 *   }
 * }
 * ```
 */
export type UseCaseFunction = (context?: FunctionalUseCaseContext) => (...args: Array<any>) => any;

/**
 * FunctionalUseCaseContext is a Context object of Functional UseCase
 */
export interface FunctionalUseCaseContext {
    dispatcher: Dispatcher;
}
