// LICENSE : MIT
"use strict";
import {QueuedStoreGroup} from "almin";
import colorMixerRepository from "../infra/ColorMixerRepository";
import ColorStore from "./ColorStore/ColorStore";
import ColorHistoryStore from "./ColorHistoryStore/ColorHistoryStore";
import WallColorStore from "./WallColorStore/WallColorStore";
export default class AppStoreGroup {
    /**
     * @returns {StoreGroup}
     */
    constructor() {
        return new QueuedStoreGroup(AppStoreGroup.create());
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