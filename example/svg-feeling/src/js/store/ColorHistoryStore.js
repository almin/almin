// LICENSE : MIT
"use strict";
import {Store} from "almin";
import ColorHistory from "../domain/ColorHistory";
export class ColorHistoryState {
    /**
     * @param {ColorHistory} history
     */
    constructor(history) {
        this.history = history
    }
}
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
        this.colorMixerRepository.onChange(() => this.emitChange());
    }


    getState(prevState) {
        const colorMixer = this.colorMixerRepository.lastUsed();
        const colorHistory = colorMixer.getHistory();
        // you can access `this.props.colorHistory` from react component
        return {
            ColorHistoryState : new ColorHistoryState(colorHistory)
        };
    }
}