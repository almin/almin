// MIT © 2017 azu
import { Store } from "../Store";
// { stateName: state }
export interface GroupState {
    [key: string]: any
}
// { stateName: Store }
export type MapStore<T> = {
    // assign T[P] to State
    [P in keyof T]: Store<T[P]>
};
// { stateName: State }
export type MapState<T> = {
    // MapStore define T[P]
    // Now, T[P] is State
    [P in keyof T]: T[P]
};
