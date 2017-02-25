export default class ColorState {
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