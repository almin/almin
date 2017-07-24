"use strict";
import { UseCase } from "almin";
import { FilterTypes } from "../store/TodoStore/TodoState";
export class FilterTodoListFactory {
    static create() {
        return new FilterTodoListUseCase();
    }
}

export class FilterTodoListUseCase extends UseCase {
    execute(filterType: FilterTypes) {
        this.dispatch({
            type: "FilterTodoListUseCase",
            filterType
        });
    }
}
