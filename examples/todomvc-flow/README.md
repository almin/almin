# TodoMVC

TodoMVC is popular example for MV* library.

## Tutorial

:memo: Please see tutorial documents!

- https://almin.js.org/docs/tutorial/todomvc-flow/

## Installation

    npm install

## Usage

    npm start
    open http://localhost:8080/

## Tests

    npm tests


### Domain Layer

- TodoList
    - `TodoList` is a collection of TodoItem

#### Value Object

- TodoItem
    - `TodoItem` is a value object for todo item.

### Store

- TodoStore
    - TodoStore merge with `TodoList`
    - TodoStore has state for filtering

## License

BSD

## Credit

This TodoMVC's component was created by [Bill Fisher](https://www.facebook.com/bill.fisher.771).

- [TodoMVC](http://todomvc.com/)
- [flux/examples/flux-todomvc at master · facebook/flux](https://github.com/facebook/flux/tree/master/examples/flux-todomvc)
