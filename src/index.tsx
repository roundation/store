import * as React from 'react';
import { separateStateAndEffects } from './helpers';
import { Omit, OmitByType, PickByType } from './types';

export type WithContext<C, N extends string = 'context'> = {
  [k in N]: C extends { Consumer: React.ComponentType<React.ConsumerProps<infer R>> } ? R : unknown
}

export type ProviderProps<C> = {
  consume: true
  children: (context: C) => React.ReactNode
} | { consume?: false }

export type SafeSetState<S> = React.Component<{}, OmitByType<S, Function>>['setState']

export default function createStore <C> (creator: (setState: SafeSetState<C>) => C) {
  const Context = React.createContext<C>(null as any)

  const Provider = class Provider extends React.Component<ProviderProps<C>, OmitByType<C, Function>> {
    effects!: PickByType<C, Function>

    constructor (props: ProviderProps<C>) {
      super(props)
      const mixedStateAndEffects = creator(this.setState.bind(this))
      const { effects, state } = separateStateAndEffects(mixedStateAndEffects)
      this.effects = effects
      this.state = state
    }

    get context (): C {
      return Object.assign({} as C, this.state, this.effects)
    }

    render () {
      const { children } = this.props

      if (!children) return null

      if (this.props.consume === true && React.Children.count(children) === 1 && typeof children === 'function') {
        return (
          <Context.Provider value={this.context}>
            <Context.Consumer>
              {children as (context: C) => React.ReactNode}
            </Context.Consumer>
          </Context.Provider>
        )
      }

      return (
        <Context.Provider value={this.context}>
          {children}
        </Context.Provider>
      )
    }
  }

  const inject = <P extends {}> (Wrapped: React.ComponentType<P>) =>
    class ComponentInjector extends React.Component<P> {
      static displayName = `Injector$${Wrapped.displayName || Wrapped.name || 'Component'})`

      render () {
        return (
          <Provider>
            <Wrapped {...this.props} />
          </Provider>
        )
      }
    }

  const connect = <
    P extends WithContext<C, N>,
    N extends string = 'context'
  > (Wrapped: React.ComponentType<P>, ctxName?: N) => {
    const contextName = ctxName || 'context' as N

    return class ComponentInjectedContext extends React.Component<Omit<P, N>> {
      static displayName = `Injected${contextName}(${Wrapped.displayName || Wrapped.name || 'Component'})`

      render () {
        return (
          <Context.Consumer>
            {context => (
              <Wrapped {...{...this.props as any, [contextName]: context}} />
            )}
          </Context.Consumer>
        )
      }
    }
  }

  const Consumer = Context.Consumer

  return { Provider, Consumer, inject, connect }
}
