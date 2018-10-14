export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type OmitType<B, C> = Pick<B, Exclude<keyof B, { [k in keyof B]: B[k] extends C ? k : never }[keyof B]>>
