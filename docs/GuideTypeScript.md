---
id: typescript
title: "TypeScript"
---

This document note some need-to-know things for TypeScript User.

## Type Definition

Almin has built-in `.d.ts` for typing.
If you use TypeScript, you can use Almin's type definition by default.

## Payload

You can use abstract `Payload` class for creating own payload.
This `Payload` class pattern is simple in TypeScript.

Example: `StartLoadingUseCase`

`StartLoadingUseCase.ts`
```ts
import { Payload, UseCase } from "almin";
export class StartLoadingPayload implements Payload {
    type = "StartLoadingPayload";
}

export class StartLoadingUseCase extends UseCase {
    execute() {
        this.dispatch(new StartLoadingPayload());
    }
}
```

Also, you just use `instanceof` type-guard. 

```ts
import { Payload, UseCase } from "almin";
import { StartLoadingPayload } from "./StartLoadingUseCase.ts";
export class ExampleStore extends Store {
    receivePayload(payload: any) {
        if(payload instanceof StartLoadingPayload){
            // payload is StartLoadingPayload
        }
    }
    // ...
}
```


## UseCase

You should use `executor` method instead of `execute` method.
Because, `executor` is type-safe method, but `execute` is not type-safe.

```ts
// OK
context.useCase(someUseCase).executor(useCase => useCase.execute(args))
```

```ts
// NG
context.useCase(someUseCase).execute(args);
```

This limitation come from TypeScript feature.
For more details, see following link.

- [TypeScript: improve UseCase#execute typing · Issue #107 · almin/almin](https://github.com/almin/almin/issues/107 "TypeScript: improve UseCase#execute typing · Issue #107 · almin/almin")

## Helper

- [almin/ddd-base: DDD base class library for JavaScript application.](https://github.com/almin/ddd-base "almin/ddd-base: DDD base class library for JavaScript application.")

## Examples

Almin + TypeScript real examples.

- [azu/faao: Faao is a GitHub issue/pull-request client on Electron.](https://github.com/azu/faao)
- [azu/irodr: RSS reader client like LDR for Inoreader.](https://github.com/azu/irodr)
- [proofdict/editor: Proofdict editor.](https://github.com/proofdict/editor)
