import { IEmit } from './IEmit'

export interface IObservable<T> {
  state: unknown[]
  subscribe: (f: unknown) => void
  unsubscribe: (f: unknown) => void
  notify: (props: IEmit<T>) => void
}
