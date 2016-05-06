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

## Let's create domain object!

### TodoList

- [ ] TodoList has business logic
- [ ] Forget persistent

#### TodoItem is value object

- [ ] What is value object

### Where domain object are stored?

- [ ] Repository is infra
- [ ] Repository is confused word, we define the term in the tutorial

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