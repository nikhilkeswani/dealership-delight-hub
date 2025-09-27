/**
 * Development-only logger utility
 * Provides structured logging that only runs in development mode
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  operation?: string;
  data?: any;
}

class Logger {
  private shouldLog(): boolean {
    return import.meta.env.DEV;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = context?.component ? `[${context.component}]` : '';
    return `${timestamp} ${prefix} ${message}`;
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog()) return;
    console.log(this.formatMessage('info', message, context), context?.data);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog()) return;
    console.warn(this.formatMessage('warn', message, context), context?.data);
  }

  error(message: string, error?: any, context?: LogContext): void {
    if (!this.shouldLog()) return;
    console.error(this.formatMessage('error', message, context), error, context?.data);
  }

  // Helper methods for common use cases
  componentRender(componentName: string, props?: any): void {
    this.info('Component rendered', { 
      component: componentName, 
      data: props 
    });
  }

  operationStart(operation: string, context?: LogContext): void {
    this.info(`Starting ${operation}`, context);
  }

  operationComplete(operation: string, context?: LogContext): void {
    this.info(`Completed ${operation}`, context);
  }
}

export const logger = new Logger();