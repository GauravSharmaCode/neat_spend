declare module '@gauravsharmacode/neat-logger' {
  interface LogMetadata {
    func?: string;
    level?: 'info' | 'warn' | 'error';
    extra?: Record<string, unknown>;
  }

  export function logWithMeta(message: string, metadata?: LogMetadata): void;
}
