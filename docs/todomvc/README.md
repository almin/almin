# TodoMVC

In this guide, we’ll walk through the process of creating a simple Todo app.

![Todo MVC](img/todomvc.png)

This todo app is based on [TodoMVC](http://todomvc.com/ "TodoMVC").

## Source Code

You can get source code for counter app from here

- https://github.com/almin/almin/tree/master/example/todomvc

```sh
git clone https://github.com/almin/almin.git

cd almin/example/todomvc
npm install
npm start
# manually open
open http://localhost:8080/
```

## What's learn from Todo app

- What is domain layer?
    - POJO(Plain Old JavaScript Object)
- What is infra layer?
    - Repository
- Which one should you used repository or store?
    - Where is persistent data? - repository
    - Where is data for view? - store

## The purpose of Todo app

Todo app has these UseCases.

- [AddTodoItem.js](../../example/todomvc/src/usecase/AddTodoItem.js)
- [FilterTodoList.js](../../example/todomvc/src/usecase/FilterTodoList.js)
- [RemoveAllCompletedItems.js](../../example/todomvc/src/usecase/RemoveAllCompletedItems.js)
- [RemoveTodoItem.js](../../example/todomvc/src/usecase/RemoveTodoItem.js)
- [ToggleAllTodoItems.js](../../example/todomvc/src/usecase/ToggleAllTodoItems.js)
- [ToggleTodoItem.js](../../example/todomvc/src/usecase/ToggleTodoItem.js)
- [UpdateTodoItemTitle.js](../../example/todomvc/src/usecase/UpdateTodoItemTitle.js)

## Story

We'll implement following work flow and see it.

1. Add Todo item
2. Toggle Todo item's status
3. ... Loop 1,2
4. Filter Todo list and show only non-completed todo items.

## Let's creating, before

Previously, We learn flux pattern to create [counter app](../counter/README.md).

![almin-architecture-flux](../counter/img/almin-architecture-flux.png)

In this guide, We learn basic CQRS(Command Query Responsibility Segregation) pattern using Almin.

CQRS split that conceptual model into separate models - Command(Write) model and Query(Read) model.

![almin-architecture-simple](./img/almin-architecture-simple.png)

In the figure, We called

- Command(Write) model "Write Stack" (Left side of the figure)
    - "Write Stack" get often complex.
    - Because, it has business logic that is well-known as **domain model**.
- Query(Read) model "Read Stack" (Right side of the figure)
    - "Read Stack" is similar concept of ViewModel and Store.

### Domain model

[Domain model](https://en.wikipedia.org/wiki/Domain_model "Domain model")is a object/class that has both behavior and data.
In other word, domain model has property(data) and method(behavior).

## Let's create domain model!

We want to create Todo app, then create `???` as domain model.

Yes, `???` is just `TodoList`!

```js
class TodoList {
    // both data and behavior
}
```

### TodoList

`TodoList` class has business logic.

- [ ] Forget persistent

#### TodoItem is value object

- [ ] What is value object

### Where domain object are stored?

- [ ] Repository is infra
- [ ] Repository is confused word, we define the term in the tutorial

### DIP

- [ ] How to resolve dependencies?

## AddTodoItem UseCase

### TodoStore 

### TodoStore subscribe changes of repository

### TodoState

## ToggleTodoItem UseCase

### Unidirectional data flow is simple

## FilterTodoList UseCase

### UseCase directly dispatch event to Store

### Already know Flux architecture.

- [ ] Same way of counter app

## Two way of updating store

- [ ] Not meaning two way binding
- [ ] Use unidirectional data flow, but two way
    - Fast path
    - Long path

## View -> UseCase -> (Thinking Point) -> Store

## Conclusion
