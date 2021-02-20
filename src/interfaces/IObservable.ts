export interface IObservable<T> {
  state: unknown[]
  subscribe: (f: unknown) => void
  unsubscribe: (f: unknown) => void
  notify: (props: T) => void
}
