---
id: warning-usecase-is-already-released
title: "UseCase is already released"
---

There are a couple of likely reasons this warning could be appearing:

- When child use-case is completed after parent use-case did completed

**Bad**:


```
        P: Parent UseCase
        C: Child UseCase

                        P fin.   C fin.
        |---------------|          |
        P    |                     |
             C---------------------|
                              |
                          C call dispatch()
```

```js
class ChildUseCase extends UseCase {
    execute() {
        this.dispatch({ type: "ChildUseCase" });
    }
}
class ParentUseCase extends UseCase {
    execute() {
        // ChildUseCase is independent from Parent
        // But, ChildUseCase is executed from Parent
        // This is programming error
        setTimeout(() => {
            this.context.useCase(new ChildUseCase()).execute();
        }, 16);
        return Promise.resolve();
    }
}
```

**Good**:

```
        P: Parent UseCase
        C: Child UseCase

                       C fin.       P fin.
        |---------------|------------|
        P    |          |
             C----------
                   |
               C call dispatch()    

 ```

```js
class ChildUseCase extends UseCase {
    execute() {
        this.dispatch({ type: "ChildUseCase" });
    }
}
class ParentUseCase extends UseCase {
    execute() {
        // Parent wait for Child is completed
        return this.context.useCase(new ChildUseCase()).execute();
    }
}
```
