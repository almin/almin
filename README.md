# [Almin.js](https://github.com/almin/almin) [![Build Status](https://travis-ci.org/almin/almin.svg?branch=master)](https://travis-ci.org/almin/almin)

[![Almin.js logo](https://almin.github.io/media/logo/logo.png)](https://github.com/almin/almin)
[![Sauce Test Status](https://saucelabs.com/buildstatus/almin)](https://saucelabs.com/u/almin)

Flux/CQRS patterns for JavaScript application.

Write code thinking :)

## Why?

Now, We can implement web application with Flux or Redux etc...

But, I often hear the story that is "Control flow of Flux/Redux is cool, but where to implement domain logic."

I think that the people skip to Flux/Redux from MV* pattern.

> MV* --> ( HOLE ) --> Flux/Redux(CQRS+EventSourcing)

Almin.js aim to fill the HOLE between MV* and Flux/Redux.

## Feature

Almin provide some pattern, is not framework.

- Testable
- Scalable
- Responsibility Layers patten - well-known as DDD(Domain-Driven Design)/CQRS

Almin is a implementation of Read/Write Stack Architecture that is well-known as Flux/CQRS.

- [Read/Write Stack | JavaScriptアーキテクチャ](http://azu.github.io/slide/2016/bikeshedjs/javascript-read-write-stack.html "Read/Write Stack | JavaScriptアーキテクチャ")

## Installation

    npm install almin

You'll also need a Promise polyfill for [older browsers](http://caniuse.com/#feat=promises).

    npm install es6-promise

## Usage

:memo: Please See [Documents](./docs) of Almin.

- [Documents](./docs)
- Tutorial
    - [Creating Counter App](./docs/counter/)
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
- [example/svg-feeling](example/svg-feeling)
    - Separate Domain and Store/State
        - Two way update state.
    - How to implement for 60 FPS 
        - Component should implement `shouldComponentUpdate()`
- [example/shopping-cart](example/shopping-cart)
    - Shopping Cart is a complex example.
    - This example is implemented of [flux-comparison](https://github.com/voronianski/flux-comparison "flux-comparison").
    - How to test.
    - How to implement domain layer.

## Running Tests

Running Tests in Node.js

    npm test
    
Running Tests in Browser

    npm run test:browser

Running Tests in [Sauce Labs](https://saucelabs.com/ "Sauce Labs: Selenium Testing, Mobile Testing, JS Unit Testing")

    # Need "~/.zuulrc" for using Sauce Labs
    npm run test:saucelabs

## Building Docs
 
    npm run build:docs
    # preview
    npm run start:docs

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
