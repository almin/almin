// LICENSE : MIT
"use strict";
import { ChangeWallColorUseCase } from "../../UseCase/ChangeWallColor";
export default class WallColorState {
    /**
     * @param {RGBAColor} wallColor
     */
    constructor({ wallColor }) {
        this.wallColor = wallColor;
    }

    reduce(payload) {
        switch (payload.type) {
            case ChangeWallColorUseCase.name:
                return new WallColorState({ wallColor: payload.color });
            default:
                return this;
        }
    }
}
