import {Handle, HandleUtils} from "./handle";

/**
 * Observe element's bounds using a best-effort approach
 */
export function observeBounds(
    element: Element,
    callback: (args: {
        previousBounds: DOMRect,
        newBounds: DOMRect,
    }) => void,
): Handle {
    let previousBounds = element.getBoundingClientRect();

    const process = () => {
        const newBounds = element.getBoundingClientRect();

        if (newBounds !== previousBounds) {
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
 * Observe _potential_ layout changes in the given element
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
    element.addEventListener('scroll', callback);

    return {
        cancel() {
            element.removeEventListener('scroll', callback);
        }
    }
}
