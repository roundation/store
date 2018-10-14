import * as React from 'react'
import { Omit, OmitType } from './types'

export type WithContext<C, N extends string = 'context'> = {
  [k in N]: C extends { Consumer: React.ComponentType<React.ConsumerProps<infer R>> } ? R : unknown
}

export default function createStore <C> (creator: (setState: React.Component<{}, OmitType<C, Function>>['setState']) => C) {
  const Context = React.createContext<C>(null as any)

  const Provider = class Provider extends React.Component<{}, C> {
    state = creator(this.setState.bind(this))

    render () {
      return (
        <Context.Provider value={this.state}>{this.props.children}</Context.Provider>
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
