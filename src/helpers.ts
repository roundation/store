import { OmitByType, PickByType } from "./types";

export function separateStateAndEffects <O>(o: O): {
  state: OmitByType<O, Function>
  effects: PickByType<O, Function>
} {
  return Object.keys(o).reduce((pair, key) => {
    if (!o.hasOwnProperty(key)) return pair

    if (typeof o[key] === 'function') {
      pair.effects[key] = o[key]
    } else {
      pair.state[key] = o[key]
    }

    return pair
  }, {
    state: {} as any,
    effects: {} as any,
  })
}
