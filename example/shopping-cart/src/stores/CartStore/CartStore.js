import { Store } from "almin";
import CartState from "./CartState";
export default class CartStore extends Store {
    /**
     * @param {CartRepository} cartRepository
     * @param {CustomerRepository} customerRepository
     */
    constructor({ cartRepository, customerRepository }) {
        super();
        // initial state
        this.state = new CartState({
            productItems: []
        });
        this.cartRepository = cartRepository;
        this.customerRepository = customerRepository;
    }

    // write/update state
    receivePayload(payload) {
        const currentCustomer = this.customerRepository.get();
        if (!currentCustomer) {
            return;
        }
        const cart = this.cartRepository.findLatByCustomer(currentCustomer);
        const newState = this.state.update({ cart });
        if (this.shouldStateUpdate(this.state, newState)) {
            this.state = newState;
        }
    }

    // read state
    getState() {
        return this.state;
    }
}
