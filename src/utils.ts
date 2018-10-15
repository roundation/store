export type IsFunction<F> = F extends (...args: any[]) => any ? F : never

export function isFunction <F>(fn: F): fn is IsFunction<F> {
  return typeof fn === 'function'
}
