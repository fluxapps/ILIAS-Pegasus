export function apply<T>(it: T, action: (it: T) => void): T {
  action(it);
  return it;
}

export function withIt<T>(it: T, action: (it: T) => void): void {action(it)}
