// LICENSE : MIT
"use strict";
const EventEmitter = require("events");
const REPOSITORY_CHANGE = "REPOSITORY_CHANGE";
import MemoryDB from "./adpter/MemoryDB";
import ColorMixer from "../domain/ColorMixer";
export class ColorMixerRepository extends EventEmitter {
    constructor(database = new MemoryDB()) {
        super();
        /**
         * @type {MemoryDB}
         */
        this._database = database;
    }

    /**
     * get instance
     * @param id
     * @private
     */
    _get(id) {
        // 本当はコンテキストを先頭に
        // Domain.<id>
        return this._database.get(`${ColorMixer.name}.${id}`);
    }

    findById(id) {
        return this._get(id);
    }

    /**
     * @returns {ColorMixer|undefined}
     */
    lastUsed() {
        const colorMixer = this._database.get(`${ColorMixer.name}.lastUsed`);
        if (!colorMixer) {
            return new ColorMixer();
        }
        return this._get(colorMixer.id);
    }

    /**
     * @param {ColorMixer} colorMixer
     */
    save(colorMixer) {
        this._database.set(`${ColorMixer.name}.lastUsed`, colorMixer);
        this._database.set(`${ColorMixer.name}.${colorMixer.id}`, colorMixer);
        this.emit(REPOSITORY_CHANGE);
    }

    /**
     * @param {ColorMixer} document
     */
    remove(document) {
        this._database.delete(`${ColorMixer.name}.${document.id}`);
        this.emit(REPOSITORY_CHANGE);
    }

    onChange(handler) {
        this.on(REPOSITORY_CHANGE, handler);
    }
}
// singleton
export default new ColorMixerRepository();
