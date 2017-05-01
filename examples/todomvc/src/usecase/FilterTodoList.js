"use strict";
import {UseCase} from "almin";
export class FilterTodoListFactory {
    static create() {
        return new FilterTodoListUseCase();
    }
}

export class FilterTodoListUseCase extends UseCase {
    execute(filterType) {
        this.dispatch({
            type: FilterTodoListUseCase.name,
            filterType
        });
    }
}