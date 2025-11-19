// Error types
export class FHEVMError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "FHEVMError";
    }
}
export class FHEVMAbortError extends FHEVMError {
    constructor(message = "FHEVM operation was cancelled") {
        super(message, "ABORTED");
        this.name = "FHEVMAbortError";
    }
}
export class FHEVMNotInitializedError extends FHEVMError {
    constructor() {
        super("FHEVM client is not initialized", "NOT_INITIALIZED");
        this.name = "FHEVMNotInitializedError";
    }
}
export class FHEVMEncryptionError extends FHEVMError {
    constructor(message, cause) {
        super(message, "ENCRYPTION_FAILED", cause);
        this.name = "FHEVMEncryptionError";
    }
}
export class FHEVMDecryptionError extends FHEVMError {
    constructor(message, cause) {
        super(message, "DECRYPTION_FAILED", cause);
        this.name = "FHEVMDecryptionError";
    }
}
//# sourceMappingURL=types.js.map