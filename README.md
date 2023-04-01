# bounding-client-rect-observer

A polyfill for the [`BoundingClientRectObserver`](https://github.com/whatwg/html/issues/9104).

This is a best-effort observer which notifies you when the bounds returned by
[`Element.getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
change.

Usage:

```typescript
const observer = new BoundingClientRectObserver((entries) => {
    entries.forEach((entry) => {
       const {target, newBounds} = entry;
       
       console.log({target, newBounds});
    });
});

// Start observing the given element's bounds
observer.observe(element);

// When you're done (removes all observers)
observer.disconnect();
```

## Known limitations

As this utility aims at a compromise between simplicity, performance and totality (biasing towards simplicity and
performance), it doesn't cover every possible case. You should test this utility with your application and see if it
works for you.

CSS animations aren't supported, you will never be notified. Adding support to this should be easy.

Inline elements affected by nearby text layout are not well-supported, you will be notified part of the time. Adding
support to this should be possible.

The element's path in the DOM tree is assumed to be static. It means that this element is not expected to be detached
from its parent at the time it's observed, neither are any of its ancestors expected to be detached from their
respective parents. Once the element is re-attached you might start missing notifications. Adding support to this could
be difficult.
