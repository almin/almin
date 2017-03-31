# Contributing Guide

## How to contribute?

You can find suitable issues to contribute on [Issues label:starter](https://github.com/almin/almin/issues?q=is%3Aissue+is%3Aopen+label%3Astarter "Issues · almin/almin").

Of course, welcome to fix the other issue or file issue. 

Basic Pull Request steps:

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## How to run tests?

Run all tests in Node.js:

    npm test
    # It includes unit test/example test

You can only run unit test:

    npm run test:js

Run unit tests in Browser:

    npm run test:browser

## How to fix document?

### Contribute to documents without [docs/api](../docs/api)

1. Fix the issue
2. Preview documents

```
npm run start:docs # preview
```

Welcome to fix documents!

### Contribute to API Reference [docs/api](../docs/api)

API Reference is automatically generated from source code(`/src/*.ts``)

1. Fix the comment of source code
2. Build API Reference

```
npm run build:docs:api # build
npm run start:docs # preview
```

## How to write document?

1. Add Markdown document to `docs/` directory.
2. Add link to [SUMMARY.md](../SUMMARY.md)

## How to release?

Run following commands:

```
npm test
npm version {patch|minor|major}
npm publish
```
