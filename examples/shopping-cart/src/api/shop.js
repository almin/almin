/**
 * Mocking client-server processing
 */
"use strict";

const Shop = exports;

const _products = require("./products.json");

const TIMEOUT = 100;

Shop.getProducts = function(cb, timeout) {
    timeout = timeout || TIMEOUT;
    setTimeout(function() {
        cb(_products);
    }, timeout);
};

Shop.buyProducts = function(payload, cb, timeout) {
    timeout = timeout || TIMEOUT;
    setTimeout(function() {
        cb();
    }, timeout);
};
