# bounding-client-rect-observer

A polyfill for the [`BoundingClientRectObserver`](https://github.com/whatwg/html/issues/9104).

This observer notifies you when the bounds returned by [`Element.getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
change.

Please note that this is a best-effort solution. See [Known Limitations](#known-limitations).

## Installation

```
npm install @html-ng/bounding-client-rect-observer
```

## Examples

### Basic Example

This example demonstrates how to create a new `BoundingClientRectObserver` instance and start observing an element's bounding client rect.

```typescript
import { BoundingClientRectObserver } from '@html-ng/bounding-client-rect-observer';

const elementToObserve = document.querySelector('#my-element');

const callback = (entries, observer) => {
    entries.forEach((entry) => {
        const {target, previousBounds, newBounds} = entry;
        console.log({target, previousBounds, newBounds});
    });
};

const observer = new BoundingClientRectObserver(callback);

observer.observe(elementToObserve);

// Remember to disconnect the observer when it's no longer needed
// observer.disconnect();
```

### Multiple Elements

This example demonstrates how to observe multiple elements using a single BoundingClientRectObserver instance.

This approach aligns with the organization of other members of the observer class family. In the future, it may provide performance benefits compared to creating a separate instance for each observed element.

```typescript
import { BoundingClientRectObserver, BoundingClientRectObserverCallback } from '@html-ng/bounding-client-rect-observer';

const elementsToObserve = document.querySelectorAll('.elements-to-observe');

const callback: BoundingClientRectObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
        const {target, previousBounds, newBounds} = entry;
        console.log({target, previousBounds, newBounds});
    });
};

const observer = new BoundingClientRectObserver(callback);

elementsToObserve.forEach((element) => {
    observer.observe(element);
});

// Remember to disconnect the observer when it's no longer needed
// observer.disconnect();
```

## API Documentation

### `BoundingClientRectEntry`

An object representing a single notification entry for an observed element when its bounding client rect changes. Properties:

- `target: Element`: The observed element whose bounding client rect has changed.
- `previousBounds: DOMRectReadOnly`: The previous bounding client rect of the element before the change.
- `newBounds: DOMRectReadOnly`: The new bounding client rect of the element after the change.

### `BoundingClientRectObserverCallback`

Signature:

```
(entries: ReadonlyArray<BoundingClientRectEntry>, observer: BoundingClientRectObserver) => void
```

A callback function that will be invoked when one or more observed elements have a change in their bounding client rects. Arguments:

- `entries: ReadonlyArray<BoundingClientRectEntry>`: An array of `BoundingClientRectEntry` objects, each representing a single observed element whose bounding client rect has changed.

- `observer: BoundingClientRectObserver`: The instance of `BoundingClientRectObserver` that triggered the callback. This can be useful if you have multiple observers and want to identify which observer the entries belong to.

### `class BoundingClientRectObserver`

The main class for creating an observer to watch for changes in the bounding client rects of specified elements.

#### `constructor(callback: BoundingClientRectObserverCallback)`

Arguments:

- `callback: BoundingClientRectObserverCallback`: The callback function that will be invoked when a bounding client rect change is detected in one or more observed elements.

#### `observe(element: Element)`

Starts observing the specified element's bounding client rect. If the element is already being observed, this method does nothing. Arguments:

- `element: Element`: The element whose bounding client rect you want to observe.

#### `disconnect()`

Stops observing all elements and removes all observers.

## Known Limitations

This utility is designed with a focus on simplicity and performance, which means that it may not cover every possible case. It is recommended to test this utility with your application to ensure it meets your requirements.

1. **CSS animations**: The current implementation does not support CSS animations. As a result, you will not receive notifications for elements with CSS animations. However, adding support for this should be relatively straightforward.

2. **Inline elements affected by text layout**: Elements that are affected by the layout of nearby text may not be fully supported, causing notifications to be delivered only part of the time. Improving support for this scenario should be possible.

3. **Static DOM tree assumption**: The utility assumes that the element's path in the DOM tree remains static while it is being observed. This means that neither the observed element nor any of its ancestors should be detached from their respective parents. If an element is re-attached, you may start missing notifications. Addressing this limitation could be challenging.

## License

Apache License 2.0
