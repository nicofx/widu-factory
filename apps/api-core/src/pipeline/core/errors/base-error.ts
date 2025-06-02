export abstract class BasePipelineError extends Error {
    abstract readonly status: number;
    readonly timestamp = Date.now();
    protected constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}