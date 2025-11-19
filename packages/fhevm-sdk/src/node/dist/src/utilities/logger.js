/**
 * Logger utility for FHEVM SDK
 *
 * Provides structured logging with different log levels and production mode support.
 * In production, only warnings and errors are logged by default.
 */
const LOG_LEVELS = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};
class Logger {
    config;
    isProduction;
    constructor(config) {
        this.isProduction = typeof window !== 'undefined'
            ? window.location?.hostname !== 'localhost' && !window.location?.hostname?.startsWith('127.0.0.1')
            : process.env.NODE_ENV === 'production';
        this.config = {
            level: this.isProduction ? 'warn' : 'debug',
            enableInProduction: false,
            prefix: '[FHEVM]',
            ...config,
        };
    }
    /**
     * Update logger configuration
     */
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Check if a log level should be output
     */
    shouldLog(level) {
        if (this.config.level === 'silent')
            return false;
        if (this.isProduction && !this.config.enableInProduction && level === 'debug')
            return false;
        return LOG_LEVELS[level] <= LOG_LEVELS[this.config.level];
    }
    /**
     * Format log message with prefix
     */
    formatMessage(level, ...args) {
        const prefix = this.config.prefix ? `${this.config.prefix} [${level.toUpperCase()}]` : `[${level.toUpperCase()}]`;
        return [prefix, ...args];
    }
    /**
     * Debug log (only in development)
     */
    debug(...args) {
        if (this.shouldLog('debug')) {
            console.debug(...this.formatMessage('debug', ...args));
        }
    }
    /**
     * Info log
     */
    info(...args) {
        if (this.shouldLog('info')) {
            console.info(...this.formatMessage('info', ...args));
        }
    }
    /**
     * Warning log
     */
    warn(...args) {
        if (this.shouldLog('warn')) {
            console.warn(...this.formatMessage('warn', ...args));
        }
    }
    /**
     * Error log (always shown unless silent)
     */
    error(...args) {
        if (this.shouldLog('error')) {
            console.error(...this.formatMessage('error', ...args));
        }
    }
    /**
     * Log with custom level
     */
    log(level, ...args) {
        switch (level) {
            case 'debug':
                this.debug(...args);
                break;
            case 'info':
                this.info(...args);
                break;
            case 'warn':
                this.warn(...args);
                break;
            case 'error':
                this.error(...args);
                break;
            case 'silent':
                break;
        }
    }
}
// Create singleton instance
export const logger = new Logger();
// Export factory for custom loggers
export function createLogger(config) {
    return new Logger(config);
}
// Export default logger instance
export default logger;
//# sourceMappingURL=logger.js.map