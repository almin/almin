import {Store} from "almin";
import CustomerState from "./CustomerState";
import AppLocator from "../../AppLocator";
export default class CustomerStore extends Store {
    /**
     * @param {CustomerRepository} customerRepository
     */
    constructor(customerRepository) {
        super();
        this.state = new CustomerState();
        customerRepository.onChange(customer => {
            const newState = new CustomerState(customer);
            if (this.state !== newState) {
                // Update Global Variable !!
                AppLocator.customer = customer;
                this.state = newState;
                this.emitChange();
            }
        });
    }

    getState() {
        return this.state;
    }
}
