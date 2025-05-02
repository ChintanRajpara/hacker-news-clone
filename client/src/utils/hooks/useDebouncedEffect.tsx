import { DependencyList, useEffect, useRef } from "react";

export function useDebouncedEffect(
  callback: (deps: DependencyList) => void,
  deps: DependencyList,
  delay: number
) {
  const firstRenderRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      callback(deps);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);
}
