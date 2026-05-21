// Server-side logger with request context support

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}] [error] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[${new Date().toISOString()}] [warn] ${message}`, ...args)
  },
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] [info] ${message}`, ...args)
  },
}
