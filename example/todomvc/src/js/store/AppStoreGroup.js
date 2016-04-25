"use strict";
import {StoreGroup} from "almin";
import TodoStore from "./TodoStore/TodoStore";
import todoRepository from "../infra/TodoRepository";
export default class AppStoreGroup {
    static create() {
        return new StoreGroup([
            new TodoStore({todoRepository})
        ]);
    }
}