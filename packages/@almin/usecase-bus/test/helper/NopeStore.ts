import { Store } from "almin";

export class NopeStore extends Store {
    getState() {
        return {};
    }
}
