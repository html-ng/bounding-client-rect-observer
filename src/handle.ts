export interface Handle {
    cancel(): void;
}

export const HandleUtils = {
    combine(
        first: Handle,
        second: Handle,
    ): Handle {
        return {
            cancel() {
                first.cancel();
                second.cancel();
            }
        }
    }
}
