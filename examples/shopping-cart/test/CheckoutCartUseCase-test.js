// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import InitializedProductRepository from "./helper/InitializedProductRepository";
import CheckoutCartUseCase from "../src/usecase/CheckoutCartUseCase";
import Customer from "../src/domain/Customer/Customer";
import Cart from "../src/domain/Cart/Cart";
import Product from "../src/domain/Product/Product";
// repository
import { CartRepository } from "../src/infra/CartRepository";
describe("CheckoutCartUseCase", function() {
    context("when the cart contain items", function() {
        it("should flush item in the cart", function(done) {
            // Given
            const { products } = InitializedProductRepository.create();
            const [product] = products;
            const customer = new Customer({ name: "Mint" });
            const cart = new Cart({ customer });
            cart.addItem(product.toProductItem());
            const cartRepository = new CartRepository();
            cartRepository.store(cart);
            // before check
            assert.equal(cart.getAllProductItems().length, 1);
            // Then
            const useCase = new CheckoutCartUseCase({
                customer,
                cartRepository
            });
            cartRepository.onChange(cart => {
                assert.equal(cart.getAllProductItems().length, 0);
                done();
            });
            // When
            useCase.execute();
        });
    });
});
