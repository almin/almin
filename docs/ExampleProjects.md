---
id: example-projects
title: "Example projects"
---

Almin provide official examples

## [examples/counter](https://github.com/almin/almin/tree/master/examples/counter)

> Tutorial: [Counter Tutorial](./TutorialCounter.md)

Simple increment counter.

### What is learn from this example?

- Flux pattern
    - Counter only has Store, not have Repository.
- How to work Almin.

## [examples/todomvc](https://github.com/almin/almin/tree/master/examples/todomvc)

> Tutorial: [Todo App tutorial](./TutorialTodoApp.md)

[TodoMVC](http://todomvc.com/) implementation.
 
- JavaScript Version: [examples/todomvc](https://github.com/almin/almin/tree/master/examples/todomvc)
- TypeScript version: [examples/todomvc-typescript](https://github.com/almin/almin/tree/master/examples/todomvc-typescript)
- Flow version: [examples/todomvc-flow](https://github.com/almin/almin/tree/master/examples/todomvc-flow)

## [examples/svg-feeling](https://github.com/almin/almin/tree/master/examples/svg-feeling)

Change color of SVG icon and Background Color rapidly.

### What is learn from this example?

- Separate Domain and Store/State
    - Two way update state.
- How to implement for 60 FPS 
    - React Component should implement `shouldComponentUpdate()`

## [examples/shopping-cart](https://github.com/almin/almin/tree/master/examples/shopping-cart)

Shopping Cart

This example implement [voronianski/flux-comparison](https://github.com/voronianski/flux-comparison "voronianski/flux-comparison: Practical comparison of different Flux solutions").

### What is learn from this example?

shopping-cart example explain the reason we encourage you to normalize your data is to avoid duplication.

- How to set initial data.
    - See [example/shopping-cart/src/usecase/Initial](https://github.com/almin/almin/tree/master/example/shopping-cart/src/usecase/Initial)
- How to implement domain model
- How to implement UseCase
- How to resolve the issue of transaction updating 
    - First, update Product's inventory.
    - Second, update Cart's products
    - This issue related with Single source of truth
- How to test UseCase and Store/State
