// LICENSE : MIT
"use strict";
import {StoreGroup} from "almin";
import colorMixerRepository from "../infra/ColorMixerRepository";
import ColorStore from "./ColorStore";
import ColorHistoryStore from "./ColorHistoryStore";
import WallColorStore from "./WallColorStore";
export default class AppStoreGroup {
    /**
     * @returns {StoreGroup}
     */
    constructor() {
        return new StoreGroup(AppStoreGroup.create());
    }

    /**
     * StateStore array
     * @type {Store[]}
     */
    static create() {
        return [
            new ColorStore({colorMixerRepository}),
            new ColorHistoryStore({colorMixerRepository}),
            new WallColorStore()
        ];
    }
}