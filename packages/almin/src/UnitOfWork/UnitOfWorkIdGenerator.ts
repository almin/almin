/**
 * UseCase incremental count is for Unique ID.
 */
let _UnitOfWorkId: number = 0;
/**
 * create new id
 */
export const generateNewId = (): string => {
    _UnitOfWorkId++;
    return String(`UnitOfWork__${_UnitOfWorkId}`);
};
