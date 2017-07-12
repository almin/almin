// LICENSE : MIT
"use strict";
import { UseCase } from "almin";
export default class ManuallLoggingUseCase extends UseCase {
    /**
     * @param {AlminLogger} logger
     */
    execute(logger) {
        logger.addLog("ManuallLoggingUseCase");
        logger.addLog(["log", "log", "log"]);
    }
}
