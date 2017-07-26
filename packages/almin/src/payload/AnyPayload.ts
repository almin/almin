/**
 * An Payload type which accepts any other properties.
 * This is not part of `Payload` itself to prevent users who are extending `Payload`.
 *
 * It would be object data.
 *
 * ## Example
 *
 * ```js
 * dispatch({
 *   type: "test",
 *   body: "data"
 * });
 */
export interface AnyPayload {
    /**
     * `type` is unique property of the payload.
     * A `type` property which may not be `undefined`
     * It is a good idea to use string constants or Symbol for payload types.
     */
    readonly type: any;

    /**
     * user-defined other properties
     */
    [extraProps: string]: any;
}
