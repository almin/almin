/**
 * UseCase incremental count is for Unique ID.
 */
let _UseCaseCount = 0;
/**
 * create new id
 */
export const generateNewId = () => {
    _UseCaseCount++;
    return String(_UseCaseCount);
};
