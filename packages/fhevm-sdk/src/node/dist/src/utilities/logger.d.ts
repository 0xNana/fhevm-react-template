/**
 * Logger utility for FHEVM SDK
 *
 * Provides structured logging with different log levels and production mode support.
 * In production, only warnings and errors are logged by default.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export interface LoggerConfig {
    level: LogLevel;
    enableInProduction: boolean;
    prefix?: string;
}
declare class Logger {
    private config;
    private isProduction;
    constructor(config?: Partial<LoggerConfig>);
    /**
     * Update logger configuration
     */
    configure(config: Partial<LoggerConfig>): void;
    /**
     * Check if a log level should be output
     */
    private shouldLog;
    /**
     * Format log message with prefix
     */
    private formatMessage;
    /**
     * Debug log (only in development)
     */
    debug(...args: any[]): void;
    /**
     * Info log
     */
    info(...args: any[]): void;
    /**
     * Warning log
     */
    warn(...args: any[]): void;
    /**
     * Error log (always shown unless silent)
     */
    error(...args: any[]): void;
    /**
     * Log with custom level
     */
    log(level: LogLevel, ...args: any[]): void;
}
export declare const logger: Logger;
export declare function createLogger(config?: Partial<LoggerConfig>): Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map