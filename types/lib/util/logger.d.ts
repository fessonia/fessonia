export interface Logger {
  debug: (...params: any[]) => void;
  error: (...params: any[]) => void;
  trace: (...params: any[]) => void;
  warn: (...params: any[]) => void;
}
