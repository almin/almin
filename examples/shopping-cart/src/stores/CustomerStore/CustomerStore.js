import { Store } from "almin";
import CustomerState from "./CustomerState";
import AppLocator from "../../AppLocator";

export default class CustomerStore extends Store {
    /**
     * @param {CustomerRepository} customerRepository
     */
    constructor(customerRepository) {
        super();
        this.customerRepository = customerRepository;
        this.state = new CustomerState();
    }

    receivePayload(payload) {
        // NOTES: THIS Application has a single anonymous customer for easy to understand
        const customer = this.customerRepository.get();
        const newState = new CustomerState(customer);
        this.setState(newState);
    }

    getState() {
        return this.state;
    }
}
