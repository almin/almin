import { FunctionalUseCaseContext } from "./FunctionalUseCaseContext";
import { UseCaseLike } from "./UseCaseLike";
import { Dispatcher } from "./Dispatcher";
export declare const defaultUseCaseName = "<Functiona-UseCase>";
/**
 * Functional version of UseCase class.
 * The user pass a function as UseCase
 * @example
 *
 * const functionalUseCase = ({ dispatcher }) => {
 *   return (...args) => {
 *      dispatcher.dispatch({ type: "fire" });
 *   }
 * }
 *
 */
export declare class FunctionalUseCase extends Dispatcher implements UseCaseLike {
    /**
     * unique id in each UseCase instances.
     */
    id: string;
    /**
     * Executor function
     */
    executor: Function;
    /**
     * Dispatcher
     */
    dispatcher: Dispatcher;
    /**
     * The default is UseCase name
     */
    name: string;
    constructor(functionUseCase: (context: FunctionalUseCaseContext) => Function, dispatcher: Dispatcher);
    /**
     * execute functional UseCase
     */
    execute(..._: Array<any>): any;
    /**
     * implementation throwError
     * @param error
     */
    throwError(error?: Error | any): void;
}
