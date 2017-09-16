// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import InitializedProductRepository from "./helper/InitializedProductRepository";
import AddItemToCartUseCase from "../src/usecase/AddItemToCartUseCase";
import Customer from "../src/domain/Customer/Customer";
import Cart from "../src/domain/Cart/Cart";
// repository
import { CartRepository } from "../src/infra/CartRepository";
describe("AddItemToCartUseCase", function() {
    context("when the customer has not cart", function() {
        it("should throw error", function(done) {
            // Given
            const { productRepository, products } = InitializedProductRepository.create();
            const customer = new Customer({ name: "Mint" });
            const cartRepository = new CartRepository();
            // Then
            const useCase = new AddItemToCartUseCase({
                customer,
                cartRepository,
                productRepository
            });
            const itemID = products[0].id;
            useCase.onError(error => {
                assert(error instanceof Error);
                done();
            });
            // When
            useCase.execute(itemID);
        });
    });
    context("when the customer has a cart", function() {
        it("should decrement item from Product", function(done) {
            // Given
            const { productRepository, products } = InitializedProductRepository.create();
            const customer = new Customer({ name: "Mint" });
            const cart = new Cart({ customer });
            const cartRepository = new CartRepository();
            cartRepository.store(cart);
            // Then
            const useCase = new AddItemToCartUseCase({
                customer,
                cartRepository,
                productRepository
            });
            const itemID = products[0].id;
            const inventoryCount = products[0].inventory;
            productRepository.onChange(product => {
                assert.equal(product.inventory, inventoryCount - 1);
                done();
            });
            // When
            useCase.execute(itemID);
        });
        it("should add item to the cart of user", function(done) {
            // Given
            const { productRepository, products } = InitializedProductRepository.create();
            const customer = new Customer({ name: "Mint" });
            const cart = new Cart({ customer });
            const cartRepository = new CartRepository();
            cartRepository.store(cart);
            // Then
            const useCase = new AddItemToCartUseCase({
                customer,
                cartRepository,
                productRepository
            });
            const itemID = products[0].id;
            cartRepository.onChange(cart => {
                const productItems = cart.getAllProductItems();
                assert.equal(productItems.length, 1);
                const [item] = productItems;
                assert.equal(item.id, itemID);
                done();
            });
            // When
            useCase.execute(itemID);
        });
    });
});
