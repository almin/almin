// MIT © 2017 azu
import * as React from "react";
import * as assert from "assert";
import { Context } from "almin";
import { shallowEqual } from "shallow-equal-object";

// Diff typing utilities
// https://qiita.com/cotttpan/items/999fe07d079298c35e0c
export type AlminReactContainerDiffKey<T extends string, U extends string> = ({ [P in T]: P } &
    { [P in U]: never } & { [x: string]: never })[T];

export type AlminReactContainerOmit<T, K extends keyof T> = Pick<T, AlminReactContainerDiffKey<keyof T, K>>;

export type AlminReactContainerDiff<T, U> = AlminReactContainerOmit<T, keyof U & keyof T>;
// T - U
export type AlminReactContainerWeakDiff<T, U> = AlminReactContainerDiff<T, U> & { [K in keyof U & keyof T]?: T[K] };

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
        return class AlminContainer extends React.Component<AlminReactContainerWeakDiff<T, P>> {
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
                return <WrappedComponent {...this.state} {...this.props} />;
            }
        };
    }
}

export default AlminReactContainer;
