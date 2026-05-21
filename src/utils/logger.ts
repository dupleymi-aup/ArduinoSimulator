// Minimal logger that respects the no-console ESLint rule
// In production these can be wired to an external logging service

const logger = {
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[error] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[warn] ${message}`, ...args)
  },
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.info(`[info] ${message}`, ...args)
  },
}

export default logger
