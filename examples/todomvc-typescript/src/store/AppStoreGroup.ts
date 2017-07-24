"use strict";
import { StoreGroup } from "almin";
import TodoStore from "./TodoStore/TodoStore";
import todoListRepository from "../infra/TodoListRepository";
export const createAppStoreGroup = () => {
    return new StoreGroup({
        todoState: new TodoStore({ todoListRepository })
    });
};
export const appStoreGroup = createAppStoreGroup();
