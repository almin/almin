// LICENSE : MIT
"use strict";
import { Store } from "almin";
import ColorHistoryState from "./ColorHistoryState";
/**
 * Simple Store pattern
 */
export default class ColorHistoryStore extends Store {
    /**
     * @param {ColorMixerRepository} colorMixerRepository
     */
    constructor({ colorMixerRepository }) {
        super();
        this.colorMixerRepository = colorMixerRepository;
        this.state = new ColorHistoryState({
            colorList: []
        });
    }

    receivePayload() {
        const colorMixer = this.colorMixerRepository.lastUsed();
        const colorHistory = colorMixer.getHistory();
        // you can access `this.props.colorHistory` from react component
        this.setState(this.state.update(colorHistory));
    }

    getState() {
        return this.state;
    }
}
