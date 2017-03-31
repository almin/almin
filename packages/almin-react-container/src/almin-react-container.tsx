// MIT © 2017 azu
import * as React from "react";
import { Context } from "almin";
export default class AlminReactContainer {
    static create<T>(WrappedComponent: React.ComponentClass<T>,
                     context: Context): React.ComponentClass<T> {
        const componentName = WrappedComponent.displayName || WrappedComponent.name;
        return class AlminContainer extends React.Component<T, {}> {
            static displayName = `AlminContainer(${componentName})`;

            state: T;
            unSubscribe: () => void | null;

            constructor() {
                super();
                this.state = context.getState<T>();
            }

            componentWillMount() {
                const onChangeHandler = () => {
                    this.setState(context.getState());
                };
                this.unSubscribe = context.onChange(onChangeHandler);
            }

            componentWillUnmount() {
                if (typeof this.unSubscribe === "function") {
                    this.unSubscribe();
                }
            }

            render() {
                return <WrappedComponent {...this.state} />;
            }
        };
    }
}
