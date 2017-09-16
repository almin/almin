// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import Customer from "../src/domain/Customer/Customer";
import Cart from "../src/domain/Cart/Cart";
import ProductItem from "../src/domain/value/ProductItem";
import { CartRepository } from "../src/infra/CartRepository";
// Store
import CartStore from "../src/stores/CartStore/CartStore";
// State
import CartState from "../src/stores/CartStore/CartState";
describe("CartState", function() {
    describe(".itemsByProduct", function() {
        it("should return [ productItem ] ", function() {
            // Given
            const customer = new Customer({ name: "Mint" });
            const cart = new Cart({ customer });
            const productItem = new ProductItem({
                id: 1,
                title: "title",
                price: 100,
                inventory: 5,
                image: "img.png"
            });
            cart.addItem(productItem);
            cart.addItem(productItem);
            const state = new CartState({
                productItems: cart.products
            });
            // then
            const itemsByProduct = state.itemsByProduct;
            const [item] = itemsByProduct;
            assert.equal(itemsByProduct.length, 1);
            assert.equal(item.id, productItem.id);
            assert.equal(item.title, productItem.title);
            assert.equal(item.price, productItem.price);
            assert.equal(item.quantity, 2);
        });
    });
    describe(".totalPrice", function() {
        it("should return total price of items", function() {
            // Given
            const customer = new Customer({ name: "Mint" });
            const cart = new Cart({ customer });
            const productItem = new ProductItem({
                id: 1,
                title: "title",
                price: 100,
                inventory: 5,
                image: "img.png"
            });
            cart.addItem(productItem);
            cart.addItem(productItem);
            const state = new CartState({
                productItems: cart.products
            });
            // then
            const totalPrice = state.totalPrice;
            assert.equal(totalPrice, 200);
        });
    });
});
describe("CartStore", function() {
    context("when CartRepository is updated", function() {
        it("should emitChange()", function() {
            const cartRepository = new CartRepository();
            const store = new CartStore(cartRepository);
            // when
            const customer = new Customer({ name: "Mint" });
            const cart = new Cart({ customer });
            cartRepository.store(cart);
            // then
            const state = store.getState();
            assert(state instanceof CartState);
        });
    });
});
