import {ReduceStore} from 'reduce-flux';
import {keys} from '../actions/ActionCreator';
const initialState = {
    addedIds: [],
    quantityById: {}
};
function reduceByID(quantityById, action) {
    switch (action.type) {
        case keys.addToCart:
            const {productID} = action;
            return Object.assign({}, quantityById, {
                [productID]: (quantityById[productID] || 0) + 1
            });
        default:
            return quantityById;
    }
}
function reduceAddIDs(addedIds, action) {
    switch (action.type) {
        case keys.addToCart:
            const {productID} = action;
            if (addedIds.indexOf(productID) !== -1) {
                return addedIds;
            }
            return [...addedIds].concat(productID);
        default:
            return addedIds;
    }
}


export default class CartStore extends ReduceStore {
    constructor() {
        super();
        this.state = initialState;
    }

    getQuantity(productID) {
        return this.state.quantityById[productID] || 0;
    }

    getAddedIds() {
        return this.state.addedIds;
    }

    reduce(state = initialState, action) {
        if(action.type === keys.finishCheckout) {
            return initialState;
        }
        return {
            addedIds: reduceAddIDs(state.addedIds, action),
            quantityById: reduceByID(state.quantityById, action)
        }
    }
}
