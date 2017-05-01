"use strict";
import {StoreGroup} from "almin";
import TodoStore from "./TodoStore/TodoStore";
import todoListRepository from "../infra/TodoListRepository";
export default class AppStoreGroup {
    static create() {
        return new StoreGroup({
            "todoState": new TodoStore({todoListRepository})
        });
    }
}