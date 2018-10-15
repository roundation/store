export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type PickByType<B, C> = Pick<B, { [k in keyof B]: B[k] extends C ? k : never }[keyof B]>

export type OmitByType<B, C> = Pick<B, Exclude<keyof B, { [k in keyof B]: B[k] extends C ? k : never }[keyof B]>>

export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
