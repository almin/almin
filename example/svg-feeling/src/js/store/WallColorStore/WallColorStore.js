// LICENSE : MIT
"use strict";
import {Store} from "almin";
import RGBAColor from "../../domain/value/RGBAColor";
import WallColorState from "./WallColorState";
export default class WallColorStore extends Store {
    constructor() {
        super();
        /**
         * @type {WallColorState}
         */
        this.state = new WallColorState({
            wallColor: new RGBAColor({rgba: "rgba(0, 0, 0, 0)"})
        });
        // from useCase
        this.onDispatch(payload => {
            this.setState(this.state.reduce(payload));
        });
    }

    setState(state) {
        if (this.state === state) {
            return;
        }
        this.state = state;
        this.emitChange();
    }

    getState() {
        return {
            WallColorState: this.state
        }
    }
}