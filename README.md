# Almin.js

Flux/CQRS patterns for JavaScript application.

Write code thinking :)

## Feature

Almin provide some pattern, is not framework.

- Testable
- Scalable
- Responsibility Layers patten - well-known Domain-Driven Design

Almin is a implementation of Read/Write Stack Architecture that is well-known as Flux/CQRS.

- [Read/Write Stack | JavaScriptアーキテクチャ](http://azu.github.io/slide/2016/bikeshedjs/javascript-read-write-stack.html "Read/Write Stack | JavaScriptアーキテクチャ")

## Installation

    npm install almin

## Usage

- [ ] Write usage instructions
- Implement flow
    - UseCase
    - Domain
    - Repository
    - Store
    - State

## Example

- [example/counter](example/counter)
    - Simple Counter example
    - It use only state
- [example/todomvc](example/todomvc)
    - Todo list example
- [example/svg-feeling](example/counter)
    - Separate Domain and Store/State
        - Two way update state.
    - How to implement for 60 FPS 
        - Component should implement `shouldComponentUpdate()`
- [example/shopping-cart](example/shopping-cart)
    - Shopping Cart is a complex example.
    - This example is implemented of [flux-comparison](https://github.com/voronianski/flux-comparison "flux-comparison").
    - How to test.
    - How to implement domain layer.

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
