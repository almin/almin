# Change Log

All notable changes to this project will be documented in this file.
See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

     <a name="2.0.0"></a>
# 2.0.0 (2017-05-01)


### Bug Fixes

* **perf:** fix perf scripts (#172) ([9850820](https://github.com/almin/almin/commit/9850820)), closes [#172](https://github.com/almin/almin/issues/172)


### Features

* **StoreGroup:** Add QueuedStoreGroup (#40) ([7a64d0d](https://github.com/almin/almin/commit/7a64d0d))


### Performance Improvements

* **test:** add memory leak testing (#33) ([2214ee7](https://github.com/almin/almin/commit/2214ee7)), closes [#32](https://github.com/almin/almin/issues/32)


* Breaking Change: Change default StoreGroup (#174) ([6565875](https://github.com/almin/almin/commit/6565875))


### BREAKING CHANGES

* Change default StoreGroup

- Make `CQRSStoreGroup` default
- Rename `CQRSStoreGroup` to `StoreGroup`
- Remove old `StoreGroup` and `QueuedStoreGroup`
-  Carve out this to module https://github.com/almin/legacy-store-group

* test(StoreGroup): add test onChange arguments

* refactor(example): migrate shopping-cart to almin 0.12

* refactor(example): migrate svg-feeling to almin 0.12

* chore(StoreGroup): add assertion to receivePayload

* refactor(example): migrate TodoMVC to almin 0.12

* refactor(example): migrate todomvc-flow to almin 0.12

* fix(TypeScript): export DispatchedPayload

#132

* fix(example): fix todomvc example

* style(example): fix style

* fix(example): fix shopping cart test

* fix(example): fix test CartSTore

* fix(example): fix immutable domain

* fix(perf): fix memory leak testing

* fix(StoreGroup): add warning to update store's state

* feat(Store): add setState as sugar

* test(Store): add Store#setState test

* refactor(Store): improve immutability warning

* refactor(example): refactor svg-feeling example

* fix(flow): update flow definition

* fix(perf): fix module

* refactor(StoreGroup): rename assert to warning

* fix(flow): fix flow type

* fix(flow): fix flow definition
