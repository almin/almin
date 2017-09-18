/**
 * StoreGroup incremental count is for Unique ID.
 */
let _StoreGroupId: number = 0;
/**
 * create new id
 */
export const generateNewId = (): string => {
    _StoreGroupId++;
    return `StoreGroup__${_StoreGroupId}`;
};
