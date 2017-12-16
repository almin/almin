# Contributing Guide

Almin uses Yarn for running development scripts.
If you haven't already done so, please [install yarn](https://yarnpkg.com/en/docs/install).

## Environment

- Node.js >= 6.0.0
- [Yarn](https://yarnpkg.com/en/docs/install)

## Bootstrap

First, you should install all dependencies by following:

    # In project root
    yarn install
    
Almin repository is monorepo top on [lerna](https://github.com/lerna/lerna "lerna").
`postinstall` life-cycle script automatically run `yarn run bootstrap` that install all deps/devDeps.

## How to contribute?

You can find suitable issues to contribute on [Issues label:good first issue](https://github.com/almin/almin/labels/good%20first%20issue).

Of course, welcome to fix the other issue or file issue. 

Basic Pull Request steps:

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## How to run tests?

Run all tests that includes examples in Node.js:

    yarn test
    # It includes unit test/example test

You can only run unit test:

    cd packages/almin && yarn test
    # or
    yarn test -- --scope almin

Run unit tests in Browser:

    cd packages/almin && yarn run test:browser

## How to fix document?

### Contribute to fix documents

1. Fix the issue
2. Preview documents

```
cd website
yarn install
yarn start
```

Welcome to fix documents!

### Contribute to fix API Reference

API Reference is automatically generated from source code(`/src/*.ts``)

1. Fix the comment of source code
2. Build API Reference

```
yarn run build:docs:api # build
```

## How to write document?

1. Add Markdown document to `docs/` directory.
2. Add link to [SUMMARY.md](../SUMMARY.md)

## How to write git commit message

Almin has adopted [Conventional Commits](https://conventionalcommits.org/ "Conventional Commits")

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## How to release?

Run following commands:

```
yarn test
yarn run publish
```
