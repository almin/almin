// LICENSE : MIT
"use strict";
import { StoreGroup } from "almin";
import colorMixerRepository from "../infra/ColorMixerRepository";
import ColorStore from "./ColorStore/ColorStore";
import ColorHistoryStore from "./ColorHistoryStore/ColorHistoryStore";
import WallColorStore from "./WallColorStore/WallColorStore";
export default class AppStoreGroup {
    /**
     * StateStore array
     * @type {Store[]}
     */
    static create() {
        return new StoreGroup({
            ColorState: new ColorStore({ colorMixerRepository }),
            ColorHistoryState: new ColorHistoryStore({ colorMixerRepository }),
            WallColorState: new WallColorStore()
        });
    }
}
