type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, tag: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${tag}]: ${message}`;
  }

  debug(tag: string, message: string, data?: unknown): void {
    if (this.isDevelopment) {
      if (data !== undefined) {
        console.debug(this.formatMessage('debug', tag, message), data);
      } else {
        console.debug(this.formatMessage('debug', tag, message));
      }
    }
  }

  info(tag: string, message: string, data?: unknown): void {
    if (data !== undefined) {
      console.info(this.formatMessage('info', tag, message), data);
    } else {
      console.info(this.formatMessage('info', tag, message));
    }
  }

  warn(tag: string, message: string, data?: unknown): void {
    if (data !== undefined) {
      console.warn(this.formatMessage('warn', tag, message), data);
    } else {
      console.warn(this.formatMessage('warn', tag, message));
    }
  }

  error(tag: string, message: string, error?: unknown): void {
    if (error !== undefined) {
      console.error(this.formatMessage('error', tag, message), error);
    } else {
      console.error(this.formatMessage('error', tag, message));
    }
  }
}

export const logger = new Logger();
