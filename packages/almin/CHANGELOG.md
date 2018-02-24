# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.16.0"></a>
# [0.16.0](https://github.com/almin/almin/compare/almin@0.15.3...almin@0.16.0) (2018-02-24)


### Bug Fixes

* **almin:** Add readonly modifier to `transaction` ([7a666b7](https://github.com/almin/almin/commit/7a666b7))
* **almin:** remove `dispatcher` from DispatchPayloadMeta ([9e7a776](https://github.com/almin/almin/commit/9e7a776))


### Features

* **almin:** Make `dispatcher` optional ([92cdcf9](https://github.com/almin/almin/commit/92cdcf9))




<a name="0.15.3"></a>
## [0.15.3](https://github.com/almin/almin/compare/almin@0.15.2...almin@0.15.3) (2018-02-05)


### Bug Fixes

* **almin:** fix CHANGELOG file ([8cd63a0](https://github.com/almin/almin/commit/8cd63a0))
* **almin:** fix test scripts ([52b9125](https://github.com/almin/almin/commit/52b9125))
* **almin:** fix trouble emit `StoreChangedPayload` ([6aaaec9](https://github.com/almin/almin/commit/6aaaec9)), closes [#328](https://github.com/almin/almin/issues/328) [#328](https://github.com/almin/almin/issues/328)




<a name="0.15.2"></a>
## 0.15.2 (2018-01-22)

### Bug Fixes

* **almin:** fix to call didExecute when UseCase throw error ([f8d402d](https://github.com/almin/almin/commit/f8d402d)), closes [#310](https://github.com/almin/almin/issues/310)

<a name="0.15.1"></a>
## 0.15.1 (2018-01-18)


### Bug Fixes

* **almin:** add warning to no-commit transaction ([#246](https://github.com/almin/almin/issues/246)) ([3417c22](https://github.com/almin/almin/commit/3417c22)), closes [#240](https://github.com/almin/almin/issues/240)
* **almin:** Do not call duplicated Store#onChange ([#231](https://github.com/almin/almin/issues/231)) ([d089295](https://github.com/almin/almin/commit/d089295))
* **almin:** export UseCaseExecutor from index ([#243](https://github.com/almin/almin/issues/243)) ([1b3d515](https://github.com/almin/almin/commit/1b3d515))
* **almin:** fix immutability warning of StoreGroup ([#205](https://github.com/almin/almin/issues/205)) ([705f583](https://github.com/almin/almin/commit/705f583))
* **almin:** fix transaction && limit multiple commit ([#249](https://github.com/almin/almin/issues/249)) ([51d9a95](https://github.com/almin/almin/commit/51d9a95))
* **almin:** Fix unused function argument in StoreGroup, Context ([#217](https://github.com/almin/almin/issues/217)) ([19499be](https://github.com/almin/almin/commit/19499be))
* **almin:** fix warning message format ([#195](https://github.com/almin/almin/issues/195)) ([630fe17](https://github.com/almin/almin/commit/630fe17))
* **almin:** Make Payload abstract class ([#286](https://github.com/almin/almin/issues/286)) ([131feda](https://github.com/almin/almin/commit/131feda))
* **almin:** make StoreGroup#state public ([#213](https://github.com/almin/almin/issues/213)) ([316770a](https://github.com/almin/almin/commit/316770a))
* **almin:** move [@types](https://github.com/types)/mocha to DevDeps ([81e58e6](https://github.com/almin/almin/commit/81e58e6))
* **almin:** Move `Context.on*` handler to `Context.events.on*` ([4d722fb](https://github.com/almin/almin/commit/4d722fb))
* **almin:** Payload subclass need to define "type" property ([186c615](https://github.com/almin/almin/commit/186c615))
* **almin:** Store#receivePayload work without StoreGroup ([#191](https://github.com/almin/almin/issues/191)) ([400dc65](https://github.com/almin/almin/commit/400dc65)), closes [#190](https://github.com/almin/almin/issues/190)
* **almin:** tryUpdateState should be called before actual finished ([#242](https://github.com/almin/almin/issues/242)) ([149b244](https://github.com/almin/almin/commit/149b244))
* **Store:** Store#onDispatch receive only dispatched the Payload by UseCase#dispatch ([#255](https://github.com/almin/almin/issues/255)) ([df1d309](https://github.com/almin/almin/commit/df1d309))
* **UseCase:** make UseCase#execute `abstract` ([#223](https://github.com/almin/almin/issues/223)) ([56d18a1](https://github.com/almin/almin/commit/56d18a1)), closes [#155](https://github.com/almin/almin/issues/155)


### Code Refactoring

* **almin:** introduce Unit of work ([#224](https://github.com/almin/almin/issues/224)) ([8e08549](https://github.com/almin/almin/commit/8e08549))


### Features

* **almin:** Add "onWillNotExecuteEachUseCase" to LifeCycleEventHub ([7c0aed3](https://github.com/almin/almin/commit/7c0aed3))
* **almin:** add BeginTransaction/EndTransaction Payload ([#238](https://github.com/almin/almin/issues/238)) ([b4f8574](https://github.com/almin/almin/commit/b4f8574))
* **almin:** add StoreChangedPayload ([16d0442](https://github.com/almin/almin/commit/16d0442))
* **almin:** Add UnitOfWork#id property ([#257](https://github.com/almin/almin/issues/257)) ([8e6bd1b](https://github.com/almin/almin/commit/8e6bd1b))
* **almin:** Context#transaction ([#226](https://github.com/almin/almin/issues/226)) ([e013d84](https://github.com/almin/almin/commit/e013d84))
* **almin:** Introduce Almin Instruments ([#280](https://github.com/almin/almin/issues/280)) ([e0e8eb2](https://github.com/almin/almin/commit/e0e8eb2))
* **almin:** support TransactionContext#id and meta.transaction.id ([#266](https://github.com/almin/almin/issues/266)) ([1c14f75](https://github.com/almin/almin/commit/1c14f75))
* **almin:** Support UseCase#shouldExecute ([7c31364](https://github.com/almin/almin/commit/7c31364))
* **textlintrc:** add Save button ([60b18a9](https://github.com/almin/almin/commit/60b18a9))
* **UseCase:** Fluent style UseCase ([#194](https://github.com/almin/almin/issues/194)) ([29933bb](https://github.com/almin/almin/commit/29933bb))


### Performance Improvements

* **almin:** add scalable stores perf test ([#187](https://github.com/almin/almin/issues/187)) ([06f4556](https://github.com/almin/almin/commit/06f4556))
* **benchmark:** add increase-store-benchmark ([#197](https://github.com/almin/almin/issues/197)) ([c7b2611](https://github.com/almin/almin/commit/c7b2611))


### Tests

* **almin:** Remove IE9/IE10 from E2E Tests ([#234](https://github.com/almin/almin/issues/234)) ([a069ec7](https://github.com/almin/almin/commit/a069ec7))


### BREAKING CHANGES

* **Store:** Store#onDispatch receive only your events
It is difference with Store#receivePayload.

* fix typo

* docs(Store): Update Store

* docs(LifeCycleEventHub): fix example

* chore(Store): describe `Store#receivePayload` role

* chore: fix example

* docs: Update docs

* docs: Update docs

* docs: Update docs

* docs: Update docs
* **almin:** remove on* handler from UseCaseExecutor.
Use UseCaseExecutor#onDispatch instead of it.

We don't know this handler use-case.
* **almin:** Drop IE9/IE10 support
* **almin:** Store can not receive un-important payload by Store#onDsipatch.
It means that Store#onDispatch can't receive willExecutePayload.
In other words, Store#onDispatch is same with Store#receivePayload.

* refactor(Context): exact factory task to UseCaseExecutorFactory

* refactor(almin): UnitOfWork can open/close for useCaseExecutor

* docs(almin): add document about Unit of Work

* docs(almin): add delegating payload

* refactor(almin): UnitOfWork use `Payload` term

* test(almin): add test for UnitOfWork

* test(almin): add release test

* docs(almin): add docs to UoW




<a name="0.14.0"></a>
# 0.14.0 (2017-09-18)


### Bug Fixes

* **almin:** add warning to no-commit transaction ([#246](https://github.com/almin/almin/issues/246)) ([3417c22](https://github.com/almin/almin/commit/3417c22)), closes [#240](https://github.com/almin/almin/issues/240)
* **almin:** Do not call duplicated Store#onChange ([#231](https://github.com/almin/almin/issues/231)) ([d089295](https://github.com/almin/almin/commit/d089295))
* **almin:** export UseCaseExecutor from index ([#243](https://github.com/almin/almin/issues/243)) ([1b3d515](https://github.com/almin/almin/commit/1b3d515))
* **almin:** fix immutability warning of StoreGroup ([#205](https://github.com/almin/almin/issues/205)) ([705f583](https://github.com/almin/almin/commit/705f583))
* **almin:** fix transaction && limit multiple commit ([#249](https://github.com/almin/almin/issues/249)) ([51d9a95](https://github.com/almin/almin/commit/51d9a95))
* **almin:** Fix unused function argument in StoreGroup, Context ([#217](https://github.com/almin/almin/issues/217)) ([19499be](https://github.com/almin/almin/commit/19499be))
* **almin:** fix warning message format ([#195](https://github.com/almin/almin/issues/195)) ([630fe17](https://github.com/almin/almin/commit/630fe17))
* **almin:** Make Payload abstract class ([#286](https://github.com/almin/almin/issues/286)) ([131feda](https://github.com/almin/almin/commit/131feda))
* **almin:** make StoreGroup#state public ([#213](https://github.com/almin/almin/issues/213)) ([316770a](https://github.com/almin/almin/commit/316770a))
* **almin:** move [@types](https://github.com/types)/mocha to DevDeps ([81e58e6](https://github.com/almin/almin/commit/81e58e6))
* **almin:** Move `Context.on*` handler to `Context.events.on*` ([4d722fb](https://github.com/almin/almin/commit/4d722fb))
* **almin:** Store#receivePayload work without StoreGroup ([#191](https://github.com/almin/almin/issues/191)) ([400dc65](https://github.com/almin/almin/commit/400dc65)), closes [#190](https://github.com/almin/almin/issues/190)
* **almin:** tryUpdateState should be called before actual finished ([#242](https://github.com/almin/almin/issues/242)) ([149b244](https://github.com/almin/almin/commit/149b244))
* **Store:** Store#onDispatch receive only dispatched the Payload by UseCase#dispatch ([#255](https://github.com/almin/almin/issues/255)) ([df1d309](https://github.com/almin/almin/commit/df1d309))
* **UseCase:** make UseCase#execute `abstract` ([#223](https://github.com/almin/almin/issues/223)) ([56d18a1](https://github.com/almin/almin/commit/56d18a1)), closes [#155](https://github.com/almin/almin/issues/155)


### Code Refactoring

* **almin:** introduce Unit of work ([#224](https://github.com/almin/almin/issues/224)) ([8e08549](https://github.com/almin/almin/commit/8e08549))


### Features

* **almin:** add BeginTransaction/EndTransaction Payload ([#238](https://github.com/almin/almin/issues/238)) ([b4f8574](https://github.com/almin/almin/commit/b4f8574))
* **almin:** add StoreChangedPayload ([16d0442](https://github.com/almin/almin/commit/16d0442))
* **almin:** Add UnitOfWork#id property ([#257](https://github.com/almin/almin/issues/257)) ([8e6bd1b](https://github.com/almin/almin/commit/8e6bd1b))
* **almin:** Context#transaction ([#226](https://github.com/almin/almin/issues/226)) ([e013d84](https://github.com/almin/almin/commit/e013d84))
* **almin:** Introduce Almin Instruments ([#280](https://github.com/almin/almin/issues/280)) ([e0e8eb2](https://github.com/almin/almin/commit/e0e8eb2))
* **almin:** support TransactionContext#id and meta.transaction.id ([#266](https://github.com/almin/almin/issues/266)) ([1c14f75](https://github.com/almin/almin/commit/1c14f75))
* **textlintrc:** add Save button ([60b18a9](https://github.com/almin/almin/commit/60b18a9))
* **UseCase:** Fluent style UseCase ([#194](https://github.com/almin/almin/issues/194)) ([29933bb](https://github.com/almin/almin/commit/29933bb))


### Performance Improvements

* **almin:** add scalable stores perf test ([#187](https://github.com/almin/almin/issues/187)) ([06f4556](https://github.com/almin/almin/commit/06f4556))
* **benchmark:** add increase-store-benchmark ([#197](https://github.com/almin/almin/issues/197)) ([c7b2611](https://github.com/almin/almin/commit/c7b2611))


### Tests

* **almin:** Remove IE9/IE10 from E2E Tests ([#234](https://github.com/almin/almin/issues/234)) ([a069ec7](https://github.com/almin/almin/commit/a069ec7))


### BREAKING CHANGES

* **Store:** Store#onDispatch receive only your events
It is difference with Store#receivePayload.

* fix typo

* docs(Store): Update Store

* docs(LifeCycleEventHub): fix example

* chore(Store): describe `Store#receivePayload` role

* chore: fix example

* docs: Update docs

* docs: Update docs

* docs: Update docs

* docs: Update docs
* **almin:** remove on* handler from UseCaseExecutor.
Use UseCaseExecutor#onDispatch instead of it.

We don't know this handler use-case.
* **almin:** Drop IE9/IE10 support
* **almin:** Store can not receive un-important payload by Store#onDsipatch.
It means that Store#onDispatch can't receive willExecutePayload.
In other words, Store#onDispatch is same with Store#receivePayload.

* refactor(Context): exact factory task to UseCaseExecutorFactory

* refactor(almin): UnitOfWork can open/close for useCaseExecutor

* docs(almin): add document about Unit of Work

* docs(almin): add delegating payload

* refactor(almin): UnitOfWork use `Payload` term

* test(almin): add test for UnitOfWork

* test(almin): add release test

* docs(almin): add docs to UoW




<a name="0.13.0"></a>
# 0.13.0 (2017-05-31)


### Bug Fixes

* **almin:** fix warning message format (#195) ([630fe17](https://github.com/almin/almin/commit/630fe17)), closes [#195](https://github.com/almin/almin/issues/195)
* **almin:** Store#receivePayload work without StoreGroup (#191) ([400dc65](https://github.com/almin/almin/commit/400dc65)), closes [#190](https://github.com/almin/almin/issues/190)


### Features

* **textlintrc:** add Save button ([60b18a9](https://github.com/almin/almin/commit/60b18a9))
* **UseCase:** Fluent style UseCase (#194) ([29933bb](https://github.com/almin/almin/commit/29933bb))


### Performance Improvements

* **almin:** add scalable stores perf test (#187) ([06f4556](https://github.com/almin/almin/commit/06f4556))
* **benchmark:** add increase-store-benchmark (#197) ([c7b2611](https://github.com/almin/almin/commit/c7b2611))




<a name="0.12.2"></a>
## 0.12.2 (2017-05-04)


### Bug Fixes

* **almin:** Store#receivePayload work without StoreGroup (#191) ([400dc65](https://github.com/almin/almin/commit/400dc65)), closes [#190](https://github.com/almin/almin/issues/190)


### Performance Improvements

* **almin:** add scalable stores perf test (#187) ([06f4556](https://github.com/almin/almin/commit/06f4556))




<a name="0.12.1"></a>
## 0.12.1 (2017-05-02)




<a name="0.12.0"></a>
# 0.12.0 (2017-05-01)
