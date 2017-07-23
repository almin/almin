"use strict";
import { UseCase } from "almin";
import { FilterType } from "../store/TodoStore/TodoState";
export class FilterTodoListFactory {
    static create() {
        return new FilterTodoListUseCase();
    }
}

export class FilterTodoListUseCase extends UseCase {
    execute(filterType: FilterType) {
        this.dispatch({
            type: "FilterTodoListUseCase",
            filterType
        });
    }
}
