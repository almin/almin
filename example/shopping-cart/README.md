# shopping-cart

Original example from:

- [voronianski/flux-comparison: Practical comparison of different Flux solutions](https://github.com/voronianski/flux-comparison "voronianski/flux-comparison: Practical comparison of different Flux solutions")

## Usage

    npm install
    npm run build
    open index.html

## What's learn from this

shopping-cart example explain the reason we encourage you to normalize your data is to avoid duplication.

### Store

shopping-cart example has two stores:

- CartStore
- ProductStore

You notice that `CartStore` have not `products` state.
`products` is only exist in `ProductStore`. `products` state should not share between two stores.

