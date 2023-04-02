import {Handle} from "./handle";
import {observeBounds} from "./observeBounds";

interface BoundingClientRectEntry {
    readonly target: Element;

    readonly previousBounds: DOMRect;

    readonly newBounds: DOMRect;
}

type BoundingClientRectObserverCallback = (
    entries: ReadonlyArray<BoundingClientRectEntry>,
    observer: BoundingClientRectObserver,
) => void;

export class BoundingClientRectObserver {
    private readonly _callback: BoundingClientRectObserverCallback;

    private readonly _handles = new Map<Element, Handle>();

    constructor(
        callback: BoundingClientRectObserverCallback,
    ) {
        this._callback = callback;
    }

    observe(element: Element) {
        if (this._isObserved(element)) {
            return;
        }

        this._startObserving(element);
    }

    disconnect() {
        this._handles.forEach((handle) => {
            handle.cancel();
        });

        this._handles.clear();
    }

    private _startObserving(element: Element) {
        const newHandle = observeBounds(
            element,
            (args) => {
                // Although the interface allows emitting multiple entries at once (to mimic similar DOM interfaces),
                // currently it's easiest to emit only one entry at the time
                this._callback([{
                    target: element,
                    previousBounds: args.previousBounds,
                    newBounds: args.newBounds,
                }], this);
            },
        );

        this._handles.set(element, newHandle);
    }

    private _isObserved(element: Element): boolean {
        return this._handles.has(element);
    }
}
