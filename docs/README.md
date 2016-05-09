# Almin.js

## What is Almin?

Almin provide Flux/CQRS patterns for JavaScript application.

It aim to create scalable app.

![overview of almin-architecture](./resources/almin-architecture.png)

The above figure is overview of Almin architecture that is similar to CQRS([Command Query Responsibility Segregation](http://martinfowler.com/bliki/CQRS.html "Command Query Responsibility Segregation")).

But, Almin is not framework, provide only these components

- Dispatcher
- Context
- UseCase
- Store
- StoreGroup

Other components like Domain, Repository and State are written by you!

Of course, Almin help you to write other components.

Also, You may notice that these components are similar to [Flux](https://github.com/facebook/flux "Flux") architecture.

Almin is also a flux implementation library. :thumbsup:

| Almin      | Flux          | Redux                  |
|------------|---------------|------------------------|
| Dispatcher | Dispatcher    | store.dispatch         |
| Context    | Container     | Middleware/React Redux |
| UseCase    | ActionCreator | Actions                |
| Store      | Store         | Store                  |
| StoreGroup | Container     | combineReducers        |
| (State)    | Store         | Reducer                |
| (Domain)   |               |                        |
|(Repository)|               |                        |

:memo: `State`, `Domain` and `Repository` is optional on Almin,
because the best for these components is vary based on application.

Almin has not perfect solution for an application, but we can write code thinking.

We are going to learn two architecture(Flux/CQRS) using Almin :)

## Table of Contents

Truly [Table of Contents](../SUMMARY.md) is here :arrow_left:

## Rough Table of Contents

Rough version of Table of Contents.

### Tutorial

- [Creating Counter App](./counter/)
    - Apply Flux pattern to Almin
- [Creating Todo App](./todomv/)
    - Apply CQRS pattern to Almin


-----

- [ ] :construction: :construction:

### Core class

- Context
- Dispatcher
- Store
- UseCase

### Sub System

- StoreGroup
- UseCaseExecutor
