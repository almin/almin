// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import colorMixerRepository from "../infra/ColorMixerRepository";
export class ChangeWallColorUseCase extends UseCase {
    static create() {
        return new this({ colorMixerRepository });
    }

    constructor({ colorMixerRepository }) {
        super();
        this.colorMixerRepository = colorMixerRepository;
    }

    execute({ x, y, width, height }) {
        const colorMixer = this.colorMixerRepository.lastUsed();
        const color = colorMixer.createColorFromPosition({ x, y, width, height });
        this.dispatch({
            type: ChangeWallColorUseCase.name,
            color
        });
    }
}
