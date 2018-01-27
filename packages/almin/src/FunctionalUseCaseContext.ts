// LICENSE : MIT
"use strict";
import { DispatchedPayload } from "./Dispatcher";

/**
 * ```js
 * const useCase = (context) => {
 *   return () => {
 *      // execute
 *   }
 * }
 * ```
 */
export type UseCaseFunction = (context: FunctionalUseCaseContext) => (...args: Array<any>) => any;

/**
 * Is `v` is UseCaseFunction?
 */
export const isUseCaseFunction = (v: any): v is UseCaseFunction => {
    return typeof v === "function";
};

/**
 * Send only dispatcher
 */
export interface DispatcherSender {
    dispatch(payload: DispatchedPayload): void;
}

/**
 * FunctionalUseCaseContext is a Context object of Functional UseCase
 */
export interface FunctionalUseCaseContext {
    dispatcher: DispatcherSender;
}
