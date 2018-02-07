---
id: typescript
title: "TypeScript"
---

This document note some need-to-know things for TypeScript User.

## Type Definition

Almin has built-in Type definition file(`.d.ts`).
If you use almin with TypeScript, you just install Almin.
Type definition file(`.d.ts`) will be loaded automatically.

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

### Further reading

- [Tackling State – Angular](https://vsavkin.com/managing-state-in-angular-2-applications-caf78d123d02)
- [Redux & Typescript typed Actions with less keystrokes](https://medium.com/@martin_hotell/redux-typescript-typed-actions-with-less-keystrokes-d984063901d)

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
