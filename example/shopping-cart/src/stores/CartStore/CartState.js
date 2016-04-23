// LICENSE : MIT
"use strict";
import Cart from "../../domain/Cart/Cart";
export default  class CartState {
    /**
     * @param {Cart} [cart]
     */
    constructor(cart = {}) {
        this.products = cart.products || [];
        
    }
}