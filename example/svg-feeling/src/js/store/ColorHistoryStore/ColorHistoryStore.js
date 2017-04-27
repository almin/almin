// LICENSE : MIT
"use strict";
import {Store} from "almin";
import ColorHistoryState from "./ColorHistoryState";
/**
 * Simple Store pattern
 */
export default class ColorHistoryStore extends Store {
    /**
     * @param {ColorMixerRepository} colorMixerRepository
     */
    constructor({colorMixerRepository}) {
        super();
        this.colorMixerRepository = colorMixerRepository;
    }


    getState() {
        const colorMixer = this.colorMixerRepository.lastUsed();
        const colorHistory = colorMixer.getHistory();
        // you can access `this.props.colorHistory` from react component
        return new ColorHistoryState(colorHistory);
    }
}
