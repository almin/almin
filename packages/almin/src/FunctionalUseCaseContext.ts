// LICENSE : MIT
"use strict";
import { Payload } from "./payload/Payload";

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
 * Send only dispatcher
 */
export interface DispatcherSender {
    dispatch(payload: Payload): void;
}

/**
 * FunctionalUseCaseContext is a Context object of Functional UseCase
 */
export interface FunctionalUseCaseContext {
    dispatcher: DispatcherSender;
}
