# @almin/usecase-container

A mediator for UseCase and Command.

## What is Command and Command handler pattern?

- [Implementing the microservice application layer using the Web API | Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api "Implementing the microservice application layer using the Web API | Microsoft Docs")
    - [日本語訳](https://docs.microsoft.com/ja-jp/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api "Web API を使用したマイクロサービス アプリケーション レイヤーの実装 | Microsoft Docs")

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @almin/usecase-container

## Usage

```ts
import { UseCase, Context } from "almin";
import { UseCaseContainer } from "@almin/usecase-container"
const context = new Context({
    store: new NopeStore()
});

class TestCommandA {
    type = "TestCommandA";
}
class TestCommandB {
    type = "TestCommandB";
}

const executed: (TestCommandA | TestCommandB)[] = [];

class TestUseCaseA extends UseCase {
    execute(command: TestCommandA) {
        executed.push(command);
    }
}
class TestUseCaseB extends UseCase {
    execute(command: TestCommandB) {
        executed.push(command);
    }
}

const container = UseCaseContainer
    .create(context)
    .bind(TestCommandA, new TestUseCaseA())
    .bind(TestCommandB, new TestUseCaseB());
// send "TestCommandA", then execute "TestUseCaseA"
container.send(new TestCommandA())
    .then(() => {
        assert.strictEqual(executed.length, 1);
        assert.ok(executed[0] instanceof TestCommandA);
    })
    .then(() => {
        // send "TestCommandB", then execute "TestUseCaseB"
        return container.send(new TestCommandB());
    }).
    then(() => {
        assert.strictEqual(executed.length, 2);
        assert.ok(executed[1] instanceof TestCommandB);
    });
```

## Changelog

See [Releases page](https://github.com/almin/almin/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/almin/almin/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
