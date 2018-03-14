export function assertOK(expression: boolean, message: string): void {
    if (!expression) {
        throw new Error(message);
    }
}
