// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
import colorMixerRepository from "../infra/ColorMixerRepository";
export class ChangeToNextColorUseCase extends UseCase {
    static create() {
        return new this({ colorMixerRepository });
    }

    constructor({ colorMixerRepository }) {
        super();
        this.colorMixerRepository = colorMixerRepository;
    }

    execute() {
        const colorMixer = this.colorMixerRepository.lastUsed();
        const nextColor = colorMixer.nextColor();
        colorMixer.setColor(nextColor);
        this.colorMixerRepository.save(colorMixer);
    }
}
