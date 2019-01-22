// MIT © 2017 azu
import * as React from "react";
import * as assert from "assert";
import { Context } from "almin";
import { shallowEqual } from "shallow-equal-object";

// Diff typing utilities
// Remove types from T that are assignable to U
export type AlminReactContainerDiff<T, U> = T extends U ? never : T;
// https://stackoverflow.com/questions/49564342/typescript-2-8-remove-properties-in-one-type-from-another
export type AlminReactContainerObjectDiff<T, U> = Pick<T, AlminReactContainerDiff<keyof T, keyof U>>;

export class AlminReactContainer {
    // T is Custom props
    // P is Almin state
    static create<T, P>(WrappedComponent: React.ComponentType<T>, context: Context<P>) {
        if (process.env.NODE_ENV !== "production") {
            assert.ok(
                typeof WrappedComponent === "function",
                "WrappedComponent should be React Component Class(Not instance)"
            );
            assert.ok(context instanceof Context, "`context` should be instance of Almin's Context");
        }
        const componentName = WrappedComponent.displayName || WrappedComponent.name;
        // AlminContainer's props is <T - P> type
        // T is State of Store, P is custom props of the `WrappedComponent`
        return class AlminContainer extends React.Component<AlminReactContainerObjectDiff<T, P>> {
            static displayName = `AlminContainer(${componentName})`;

            state: P;
            unSubscribe: () => void | null;

            onChangeHandler = () => {
                this.setState(context.getState());
            };

            constructor(props: any) {
                super(props);
                this.state = context.getState();
                this.unSubscribe = context.onChange(this.onChangeHandler);
            }

            shouldComponentUpdate(_nextProps: any, nextState: any) {
                // Almin StoreGroup use Object.assign merging by default
                // It means that theses states are not strict equal always.
                return !shallowEqual(this.state, nextState);
            }

            componentWillUnmount() {
                if (typeof this.unSubscribe === "function") {
                    this.unSubscribe();
                }
            }

            render() {
                // Workaround TS2.3.1: https://github.com/Microsoft/TypeScript/pull/13288
                const C: any = WrappedComponent as any;
                return <C {...this.state} {...this.props} />;
            }
        };
    }
}

export default AlminReactContainer;
