---
id: hello-world
title: "Hello World"
---

Previously, you have seen [components of almin](./Components.md).

[examples/introduction](../examples/introduction) is simple Hello World app that show the components in a single file.

[include](../examples/introduction/index.js)

### :warning: Real example

[examples/introduction](../examples/introduction) prefer to [concept of components](./Components.md) than correctness for implementation.

You want to know real implementation and see other examples.

You can see actual example in [Creating Counter App](counter/README.md) and other examples.

## Others

![Overview of almin-architecture](assets/almin-architecture.png)

This hello world not say all thing of Almin.

- **UseCase** is also entry point of **domain** model
- **Domain** is business logic on your application
- **StoreGroup** can handling multiple **Store**s
- **Store** can apply reducer pattern like [Redux](https://github.com/reactjs/redux "Redux")
- etc...

If you want know these, please see [TodoMVC tutorial](tutorial/todomvc/README.md) and other examples.

- [examples/shopping-cart](https://github.com/almin/almin/tree/master/examples/shopping-cart)
