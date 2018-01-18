---
id: getting-started
title: "Getting Started"
---

Almin provides Flux/CQRS(Command Query Responsibility Segregation) patterns for JavaScript application.

## Features

Almin provides some patterns, is not a framework.

- Scalable – work with Medium-small(1,000LOC) – Large(100,000LOC)
- Testable – can implement UseCase/Store/Domain as separated components
- Debuggable – [Logger](GuideLogging.md), [DevTools](https://github.com/almin/almin-devtools), [Performance monitoring](GuidePerformancProfile.md)
- Support Layered architecture – work with DDD(Domain-Driven Design)/CQRS(Command Query Responsibility Segregation)
- Support [TypeScript](https://www.typescriptlang.org/ "TypeScript") and [Flow](https://flow.org/ "FlowType")

## Installation

Install almin using [npm](https://www.npmjs.com/):

    npm install almin

## Browser Support

Almin supports all popular browsers.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/almin.svg)](https://saucelabs.com/u/almin)

Although `Promise` polyfill is required for older browsers.

> **Note:**
> You'll also need a Promise polyfill like [es6-promise](https://github.com/stefanpenner/es6-promise "es6-promise") for [older browsers](https://caniuse.com/#feat=promises).
