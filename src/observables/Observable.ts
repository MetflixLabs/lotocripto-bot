import { IObservable } from '../interfaces/IObservable'

export function Observable<T>(): IObservable<T> {
  let state: any[] = []

  function subscribe(f: any) {
    state.push(f)
  }

  function unsubscribe(f: any) {
    state = state.filter(func => func !== f)
  }

  function notify(props: T) {
    state.forEach(f => f(props))
  }

  return {
    state,
    subscribe,
    unsubscribe,
    notify,
  }
}
