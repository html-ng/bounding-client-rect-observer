import {Handle} from "./handle";
import {observeBounds} from "./observeBounds";

interface BoundingClientRectEntry {
    readonly target: Element;

    readonly previousBounds: DOMRectReadOnly;

    readonly newBounds: DOMRectReadOnly;
}

type BoundingClientRectObserverCallback = (
    entries: ReadonlyArray<BoundingClientRectEntry>,
    observer: BoundingClientRectObserver,
) => void;

/**
 * Class representing an observer that can be used to monitor changes in the bounding client rect of multiple elements.
 */
export class BoundingClientRectObserver {
    private readonly _callback: BoundingClientRectObserverCallback;

    private readonly _handles = new Map<Element, Handle>();

    constructor(
        callback: BoundingClientRectObserverCallback,
    ) {
        this._callback = callback;
    }

    /**
     * Start observing changes in the bounding client rect of the given element.
     *
     * @param element - the element to observe
     */
    observe(element: Element): void {
        if (this._isObserved(element)) {
            return;
        }

        this._startObserving(element);
    }

    /**
     * Stop observing all elements
     */
    disconnect(): void {
        this._handles.forEach((handle) => {
            handle.cancel();
        });

        this._handles.clear();
    }

    private _startObserving(element: Element): void {
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
