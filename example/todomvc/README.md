# shopping-cart

Original example from:

- [voronianski/flux-comparison: Practical comparison of different Flux solutions](https://github.com/voronianski/flux-comparison "voronianski/flux-comparison: Practical comparison of different Flux solutions")

## Usage

    npm install
    npm run build
    open index.html

## What's learn from this

shopping-cart example explain the reason we encourage you to normalize your data is to avoid duplication.

- How to test UseCase and Store/State.
- How to set initial data.
    - See [example/shopping-cart/src/usecase/Initial](example/shopping-cart/src/usecase/Initial)

### Domain Layer

- Cart
    - `Cart` is shopping cart
- Product
    - `Product` is catalog of product.
    - It has `inventory` level.
    - The Customer can pick up a `ProductItem` and add the item to the own `Cart`. 
- Customer
    - `Customer` is abstraction of user.
    - This example tread a single `AnonymousCustomer`. It means that exist one Customer in the global. 

#### Value Object

- `ProductItem`
    - `ProductItem` is a item object.

### Store

shopping-cart example has three stores:

- CartStore
    - Display Cart information
    - Total price
    - Count of items in the cart
- ProductStore
    - Display Window for product
- CustomerStore
    - current customer 

### AppLocator

- `Customer` always is a single. So, AppLocator have global `customer` property.
    - It is easy to use `customer`.