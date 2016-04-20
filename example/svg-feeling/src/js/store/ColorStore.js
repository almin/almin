// LICENSE : MIT
"use strict";
import {Store} from "almin";
import Color from "../domain/value/Color";

/*
    Separate Store and State class pattern

    Implementation Note:

    Current, StoreGroup use `XXXStore` as key, is not `XXXState`.
    
 */
export class ColorState {
    /**
     * @param {Color} currentColor
     */
    constructor({currentColor}) {
        this.currentColor = currentColor;
    }

    /**
     * @param {Color} color
     */
    reduceDomain(color) {
        return new ColorState({
            currentColor: color
        });
    }

    reduce(payload) {
        switch (payload.type) {
            default:
                return this;
        }
    }
}
export default class ColorStore extends Store {
    /**
     * @param {ColorMixerRepository} colorMixerRepository
     */
    constructor({colorMixerRepository}) {
        super();
        this.state = new ColorState({
            currentColor: new Color({hexCode: "#fff"})
        });
        // from Repository
        colorMixerRepository.onChange(() => {
            const color = colorMixerRepository.lastUsed().currentColor();
            this.state = this.state.reduceDomain(color);
            this.emitChange();
        });
    }

    getState() {
        return {
            ColorState: this.state
        }
    }
}