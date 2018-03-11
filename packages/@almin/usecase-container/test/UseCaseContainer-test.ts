import { UseCase, Context } from "almin";
import { UseCaseContainer } from "../src";
import { NopeStore } from "./helper/NopeStore";
import * as assert from "assert";

describe("UseCaseContainer", () => {
    it("should send command to bound useCase", () => {
        const context = new Context({
            store: new NopeStore()
        });

        class TestCommand {
            type = "TestCommand";
        }

        const executed: TestCommand[] = [];

        class TestUseCase extends UseCase {
            execute(command: TestCommand) {
                executed.push(command);
            }
        }

        const container = UseCaseContainer.create(context).bind(TestCommand, new TestUseCase());
        return container.send(new TestCommand()).then(() => {
            assert.strictEqual(executed.length, 1);
            assert.ok(executed[0] instanceof TestCommand);
        });
    });
    it("should bind multple command and useCase", () => {
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

        const container = UseCaseContainer.create(context)
            .bind(TestCommandA, new TestUseCaseA())
            .bind(TestCommandB, new TestUseCaseB());
        return container
            .send(new TestCommandA())
            .then(() => {
                assert.strictEqual(executed.length, 1);
                assert.ok(executed[0] instanceof TestCommandA);
            })
            .then(() => {
                return container.send(new TestCommandB());
            })
            .then(() => {
                assert.strictEqual(executed.length, 2);
                assert.ok(executed[1] instanceof TestCommandB);
            });
    });

    it("should bind a Command to multiple useCase", () => {
        const context = new Context({
            store: new NopeStore()
        });

        class TestCommand {
            type = "TestCommand";
        }
        const executed: TestCommand[] = [];

        class TestUseCaseA extends UseCase {
            execute(command: TestCommand) {
                executed.push(command);
            }
        }
        class TestUseCaseB extends UseCase {
            execute(command: TestCommand) {
                executed.push(command);
            }
        }

        const container = UseCaseContainer.create(context)
            .bind(TestCommand, new TestUseCaseA())
            .bind(TestCommand, new TestUseCaseB());
        return container.send(new TestCommand()).then(() => {
            assert.strictEqual(executed.length, 2);
            assert.ok(executed[0] instanceof TestCommand, "0 should be TestCommand");
            assert.ok(executed[1] instanceof TestCommand, "1 should be TestCommand");
        });
    });
});
