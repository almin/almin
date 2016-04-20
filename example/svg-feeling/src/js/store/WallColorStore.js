// LICENSE : MIT
"use strict";
import {Store} from "almin";
import {ChangeWallColorUseCase} from "../UseCase/ChangeWallColor";
import RGBAColor from "../../js/domain/value/RGBAColor";
export class WallColorState {
    /**
     * @param {RGBAColor} wallColor
     */
    constructor({wallColor}) {
        this.wallColor = wallColor;
    }

    reduce(payload) {
        switch (payload.type) {
            case ChangeWallColorUseCase.name:
                return new WallColorState({wallColor: payload.color});
            default:
                return this;
        }
    }
}
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