import { Context } from "almin";
import * as React from "react";
// Provider
export type ProviderProps<T> = {
    initialState?: T;
    children: React.ReactNode;
};

// Consumer
export type ConsumerProps<T> = {
    children: (props: T) => React.ReactNode;
};

export function createReactContext<T>(
    alminContext: Context<T>
): {
    Provider: React.ComponentType<ProviderProps<T>>;
    Consumer: React.ComponentType<ConsumerProps<T>>;
} {
    const initialState = alminContext.getState();
    const StateContext: React.Context<any> = React.createContext(initialState);

    // Provider
    class Provider extends React.PureComponent<ProviderProps<T>> {
        private releaseHandler: () => void;

        constructor(props: ProviderProps<T>) {
            super(props);
            // If <Provider initialState={state} />, prefer to use the props value
            // This props.initialState is for testing
            this.state = props.initialState || initialState;
            this.releaseHandler = alminContext.onChange(this.onChange);
        }

        private onChange = () => {
            this.setState(alminContext.getState());
        };

        componentWillUnmount() {
            this.releaseHandler();
        }

        render() {
            if (StateContext === null) {
                return null;
            }
            return <StateContext.Provider value={this.state}>{this.props.children}</StateContext.Provider>;
        }
    }

    // Consumer
    class Consumer extends React.PureComponent<ConsumerProps<T>> {
        render() {
            if (StateContext === null) {
                throw new Error(
                    "You must wrap your <Consumer> components with a <Provider> component.\n" +
                        "You can get <Provider> component via `createContext()` API."
                );
            }
            return (
                <StateContext.Consumer>
                    {(value) => {
                        return this.props.children(value);
                    }}
                </StateContext.Consumer>
            );
        }
    }

    return {
        Provider,
        Consumer,
    };
}
