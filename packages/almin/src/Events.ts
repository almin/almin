export interface EventListener<T> {
    (event: T): any;
}

/**
 * Dispose event handler
 */
export type EventDisposable = () => void;

/**
 * Tiny Events class
 *
 * - One `Events` has one type
 * - Each event  handler has one object
 */
export class Events<T> {
    private listeners: EventListener<T>[] = [];
    private listenersOnce: EventListener<T>[] = [];

    addEventListener(listener: EventListener<T>): EventDisposable {
        this.listeners.push(listener);
        return () => this.removeEventListener(listener);
    }

    addEventListenerOnce(listener: EventListener<T>): void {
        this.listenersOnce.push(listener);
    }

    removeEventListener(listener: EventListener<T>): void {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex !== -1) {
            this.listeners.splice(callbackIndex, 1);
        }
    }

    removeAllEventListeners(): void {
        this.listeners = [];
        this.listenersOnce = [];
    }

    emit(payload: T): void {
        /** Update any general listeners */
        this.listeners.forEach(listener => listener(payload));

        /** Clear the `once` queue */
        if (this.listenersOnce.length > 0) {
            this.listenersOnce.forEach(listener => listener(payload));
            this.listenersOnce = [];
        }
    }
}
