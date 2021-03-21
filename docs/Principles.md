---
id: principles
title: "Principles"
---

This document describes almin's principles:

## CQRS

Command and Query Responsibility Segregation(CQRS) is a pattern.

> "CQRS is simply the creation of two objects where there was previously only one. The separation occurs based upon whether the methods are a command or a query (the same definition that is used by Meyer in Command and Query Separation: a command is any method that mutates state and a query is any method that returns a value)."
> -- [CQRS, Task Based UIs, Event Sourcing agh! | Greg Young](http://codebetter.com/gregyoung/2010/02/16/cqrs-task-based-uis-event-sourcing-agh/ "CQRS, Task Based UIs, Event Sourcing agh! | Greg Young")

CQRS separates "one" model to "two" models.
CQRS has two models that are Command(Write) model and Query(Read) model.

For example, Flux's store is a "one" model, but it is also Write and Read model. 

### In Flux

[Flux architecture](https://facebook.github.io/flux/ "Flux") defines [Stores](https://facebook.github.io/flux/docs/in-depth-overview/#stores "Stores") role.

> Stores contain the application state and logic. 
> -- [Stores](https://facebook.github.io/flux/docs/in-depth-overview/#stores "Stores")

It means that Store is a single model, but has two task - `state` and `logic`.

- On Application Layer: Store has application state
- On Domain Layer: Store has business logic

![Flux Layering](/docs/assets/flux-layer.png)

**Complexity**

The Complexity: **N × M** (multiplication)

Store is both Write stack and Read stack.

- **N**: **Store does logic and updates State(Write)**
- **M**: **Store returns State for View(Read)**

### In Almin/CQRS

Almin separates Store's two task to one task.
Store has only `state` role and Almin moves `logic` to domain model.
(Domain model has business logic)

![Flux Layering + CQRS](/docs/assets/flux-layer-cqrs.png)

Additionally, Almin introduces domain model for `logic` role.

- On Application Layer: Store has application state
- On Domain Layer: Domain model has bossiness logic

![Almin Layering](/docs/assets/almin-layer.png)

**Complexity**

The Complexity: **N + M** (addition)

Domain model is write stack and Store is read stack.

- **N**: **Domain model does logic and updates State(Write)**
- **M**: **Store returns State for View(Read)**

Almin aims to reduce the complexity at large application.

<!-- textlint-disable -->

Quote from [Microsoft .NET - Architecting Applications for the Enterprise (2nd Edition)](https://www.amazon.com/dp/0735685355/ "Microsoft .NET - Architecting Applications for the Enterprise (2nd Edition)") ([日本語](https://www.amazon.co.jp/dp/B00ZQZ8JNE/))

<!-- textlint-enable -->

![domain vs. cqrs](/docs/assets/domain-cqrs.png)

**Related**:

- [CQRS](https://martinfowler.com/bliki/CQRS.html "CQRS")
- [CQRS Journey](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10) "CQRS Journey")

## Unit of work

Almin has a [Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html "Unit of Work").
It is a actual internal class and Almin applies Unit of Work pattern.

- Unit of Work can stop unintended updating of `StoreGroup`
- In other word, The user can control updating of `StoreGroup` while a series of UseCase is executing 

The following figure describes it:

[![unit of work](/docs/assets/almin-unit-of-work.png)][unit-of-work]

[unit-of-work]: http://www.nomnoml.com/#view/%23padding%3A%2010%0A%0A%5BUseCase%7C%0A%20%20%20%20%5BUseCase%20Executor%20A%7C%0A%20%20%20%20%20%20%20%20%5B%3Cusecase%3EChild%20UseCase%5D%0A%20%20%20%20%5D%20--%3E%20%5BUseCase%20Executor%20B%5D%0A%20%20%20%20%5BUseCase%20Executor%20B%7C%0A%20%20%20%20%20%20%20%20%5B%3Cusecase%3EUseCase%5D%0A%20%20%20%20%5D%0A%5D%0A%5BUnit%20of%20Work%7C%0A%20%20%20%20%5BCommitments%7C%0A%20%20%20%20%20%20%20%20%5BDispatched%20Payload%5D%0A%20%20%20%20%20%20%20%20%5BSystem%20Payload%5D%0A%20%20%20%20%5D%0A%5D%0A%5BStoreGroup%7C%0A%20%20%20%20%5BStore%5D%0A%20%20%20%20%5B%3Cnote%3Eif%20any%20store%20is%20change%2C%20it%20emit%20changed%5D%0A%5D%0A%5BUseCase%5D%20payload%20--%3E%20%5BLifeCycleEventHub%7C%0A%09%5BDispatcher%5D%0A%5D%0A%5BUseCase%5D%20payload%20--%3E%20%5B%3Creadonly%3EUnit%20of%20Work%5D%0A%5BUnit%20of%20Work%5D%20%3Ctransaction%20event%3E%20--%3E%20%5BLifeCycleEventHub%5D%0A%5BUnit%20of%20Work%5D%20Commitment%20--%3E%20%5BStoreGroup%5D%20%0A%5BStoreGroup%5D%20changes%20--%3E%20%5BLifeCycleEventHub%5D%0A%5BLifeCycleEventHub%5D%20%3C-%20%5BContext%5D%0A
