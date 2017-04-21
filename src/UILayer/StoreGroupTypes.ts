// MIT © 2017 azu
import { Store } from "../Store";
// { stateName: Store }
export type StoreMap<T> = {
    // T[P] as Store<State>
    // Now, State is T[P}
    [P in keyof T]: Store<T[P]>
};
// { stateName: State }
export type StateMap<T> = {
    // StoreMap define T[P]
    // Now, T[P] is State
    [P in keyof T]: T[P]
};
