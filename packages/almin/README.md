# [Almin](https://github.com/almin/almin) [![Build Status](https://travis-ci.org/almin/almin.svg?branch=master)](https://travis-ci.org/almin/almin)

[![Almin.js logo](https://almin.js.org/media/logo/logo.png)](https://github.com/almin/almin)

## Installation

    npm install almin

You'll also need a Promise polyfill for [older browsers](http://caniuse.com/#feat=promises).

    npm install es6-promise

## Usage

:memo: Please See [https://almin.js.org/](https://almin.js.org/) for details.

- :book: Documentation of Almin
- [https://almin.js.org/](https://almin.js.org/)

## What is Almin?

Almin provides Flux/CQRS patterns for JavaScript applications.

It aims to create a scalable app.

![Overview of almin-architecture](/docs/assets/almin-architecture.png)

The above figure is overview of Almin architecture that is similar to CQRS([Command Query Responsibility Segregation](https://martinfowler.com/bliki/CQRS.html "Command Query Responsibility Segregation")).

But, Almin is not a framework, provides only these components

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

Almin has not a perfect solution for an application, but we can write code thinking.

We are going to learn two architectures(Flux/CQRS) using Almin :)

## Running tests

Run tests in Node.js

    npm test

Run tests in Browser

    npm run test:browser

Run tests in [Sauce Labs](https://saucelabs.com/ "Sauce Labs: Selenium Testing, Mobile Testing, JS Unit Testing")

    # Need "~/.zuulrc" for using Sauce Labs
    npm run test:saucelabs

## Contributing

Please see [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) for more details.

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
