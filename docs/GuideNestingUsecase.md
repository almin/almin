---
id: nesting-usecase
title: "Nesting UseCase"
---

`UseCase` can be nesting.
It means that some UseCase `execute` other UseCase.
 
`UseCase` instance has `this.context` object that is same with `Context` instance.
 
For example, ParentUseCase -> ChildUseCase.
 
```js 
class ChildUseCase extends UseCase {
    execute() {
    }
}
class ParentUseCase extends UseCase {
    execute() {
        const childUseCase = new ChildUseCase();
        // use `this.context` insteadof the instance of `Context`
        return this.context.useCase(childUseCase).execute();
    }
}
const parentUseCase = new ParentUseCase();
const childUseCase = new ChildUseCase();
const dispatcher = new Dispatcher();
const context = new Context({
    dispatcher,
    store: new Store()
});
context.useCase(parentUseCase).execute().then(() => {
  /*
These UseCases are executed following order:  

- ParentUseCase: will execute
- ChildUseCase:  will execute
- ChildUseCase:  did execute
- ParentUseCase: did execute
- ChildUseCase:  complete
- ParentUseCase: complete
  */
});
```

It is useful for transaction of application or Toggle UseCase(Play/PauseUseCase) etc...

## UseCase of Nesting UseCase

For example, We already have `AppUserFetchSearchResultUseCase` that fetchs the result of search with a search word.

```js
import { UseCase } from "almin";
export class AppUserFetchSearchResultUseCase extends UseCase {
    execute(searchWord){
        return fetch(`/search/${encodeURIComponent(searchWord)}`)
            .then(res => res.json())
            .then(json => {
               // update domain/repository/store... 
            });
    }
}
```

Additional, We want to add `AppUserReloadSearchResultUseCase` that fetchs the result of the current search word again and refresh view.

Nesting UseCase helps you to reduce duplicated workflow.

```js
import { UseCase } from "almin";
import { AppUserFetchSearchResultUseCase } from "./AppUserFetchSearchResultUseCase";

export class AppUserReloadSearchResultUseCase extends UseCase {
    execute(){
        const currentSearchWord = `<Need Implementation>get current word from repository...`;
        // invoke UseCase from AppUserReloadSearchResultUseCase
        return this.context.useCase(new AppUserFetchSearchResultUseCase())
            .execute(currentSearchWord)
            .then(() => {
                // do refresh logic
            });
    }
}
```

Almin's nesting UseCase represents **extended use case** in [Use case diagram](https://en.wikipedia.org/wiki/Use_case_diagram "Use case diagram").

**Related topics**:

- [IncludeAndExtend](https://martinfowler.com/bliki/IncludeAndExtend.html "IncludeAndExtend")
- [uml - What's is the difference between include and extend in use case diagram? - Stack Overflow](https://stackoverflow.com/questions/1696927/whats-is-the-difference-between-include-and-extend-in-use-case-diagram "uml - What&#39;s is the difference between include and extend in use case diagram? - Stack Overflow")

### FAQ: Should we use Nesting UseCase for reducing duplicated logic?

**No**. We should write logic to domain model and write workflow to UseCase.
You should write the logic to domain model and reuse it in UseCases.

But, If you use transaction script, the answer is Yes.
