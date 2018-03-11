# @almin/usecase-container

A mediator for UseCase and Command.

- CommandBus

## What is Command and Command handler pattern?

- [Implementing the microservice application layer using the Web API | Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api "Implementing the microservice application layer using the Web API | Microsoft Docs")
    - [日本語訳](https://docs.microsoft.com/ja-jp/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api "Web API を使用したマイクロサービス アプリケーション レイヤーの実装 | Microsoft Docs")

### Command

- A bus send Command to a single Command Handler
- Command may be rejected by system
- Command may be failed during executing in Handler
- Command may be various effect in system state
- Command does not be over the boundary
- Command should have imperative named.

## What is merits?

- Flexible
- Retry the UseCase
- Logging
- Adoptable
- Additional Event

## What is de-merits?

- Add new Layer(CommandBus)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @almin/usecase-container

## Usage

```ts
import { UseCase, Context } from "almin";
import { UseCaseContainer } from "@almin/usecase-container"
// async code
(async () => {
    const context = new Context({
        store: new NopeStore()
    });

    class CommandA {
        type = "CommandA";
    }

    class CommandB {
        type = "CommandB";
    }

    const executed: (CommandA | CommandB)[] = [];

    class TestUseCaseA extends UseCase {
        execute(command: CommandA) {
            executed.push(command);
        }
    }

    class TestUseCaseB extends UseCase {
        execute(command: CommandB) {
            executed.push(command);
        }
    }

    const createTestUseCaseB = (_command: CommandB) => {
        return new TestUseCaseB();
    };

    // create binding between Command Constructor and UseCase/UseCaseFactory.
    const container = UseCaseContainer.create(context)
        .bind(CommandA, new TestUseCaseA())
        .bindFactory(CommandB, createTestUseCaseB);
    // send CommandA => execute TestUseCaseA
    await container.send(new CommandA());
    assert.strictEqual(executed.length, 1);
    assert.ok(executed[0] instanceof CommandA);
    // send CommandB => execute createTestUseCaseB()
    await container.send(new CommandB());
    assert.strictEqual(executed.length, 2);
    assert.ok(executed[1] instanceof CommandB);
})()
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
