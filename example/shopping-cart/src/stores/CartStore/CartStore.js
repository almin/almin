import {Store} from "almin";
import CartState from "./CartState";
export default class CartStore extends Store {
    /**
     * @param {CartRepository} cartRepository
     */
    constructor(cartRepository) {
        super();
        this.state = new CartState();
        cartRepository.onChange(cart => {
            const newState = new CartState(cart);
            if (this.state !== newState) {
                this.state = newState;
                this.emitChange();
            }
        });
    }

    getState() {
        return {
            CartState: this.state
        };
    }
}