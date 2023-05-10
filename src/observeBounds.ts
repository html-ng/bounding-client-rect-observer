import {Handle, HandleUtils} from "./handle";

/**
 * Observe changes to the bounding client rect of an element using a best-effort approach.
 *
 * @returns a handle that allows canceling the observation
 */
export function observeBounds(
    element: Element,
    callback: (args: {
        previousBounds: DOMRectReadOnly,
        newBounds: DOMRectReadOnly,
    }) => void,
): Handle {
    let previousBounds = element.getBoundingClientRect();

    const process = () => {
        const newBounds = element.getBoundingClientRect();

        if (!rectEquals(newBounds, previousBounds)) {
            callback({
                previousBounds,
                newBounds,
            });

            previousBounds = newBounds;
        }
    }

    const mutationObserver = new MutationObserver(process);
    const resizeObserver = new ResizeObserver(process);

    return HandleUtils.combine(
        {
            cancel() {
                mutationObserver.disconnect();
                resizeObserver.disconnect();
            }
        },
        observeLayout(
            element,
            mutationObserver,
            resizeObserver,
            process,
        ),
    )
}

/**
 * Observe layout changes that could potentially affect the given element's bounds.
 * This function sets up observation for style changes, parent's size changes, scroll events, and recursively observes
 * ancestors for layout changes as well.
 *
 * @return a handle that can be used to cancel the observation.
 */
function observeLayout(
    element: Element,
    mutationObserver: MutationObserver,
    resizeObserver: ResizeObserver,
    callback: () => void,
): Handle {
    // Observe style changes, which are one of very important triggers of layout changes
    mutationObserver.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class'],
    });

    const parent = element.parentElement;

    if (!parent) {
        return {
            cancel() {
            }
        };
    }

    // Parent's size reflects most changes of the siblings' layout, so let's observe it
    resizeObserver.observe(parent);

    return HandleUtils.combine(
        // Observe scroll events, as scrolling affects element's bounds
        observeScroll(
            parent,
            callback,
        ),
        // Recurse
        observeLayout(
            parent,
            mutationObserver,
            resizeObserver,
            callback,
        ),
    );
}

function observeScroll(
    element: Element,
    callback: () => void,
): Handle {
    element.addEventListener('scroll', callback, {
        passive: true,
    });

    return {
        cancel() {
            element.removeEventListener('scroll', callback);
        }
    }
}

function rectEquals(a: DOMRectReadOnly, b: DOMRectReadOnly): boolean {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}
