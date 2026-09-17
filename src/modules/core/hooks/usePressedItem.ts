import { useEffect, useState } from "react";

export function usePressedItem<T>() {
  const [item, setItem] = useState<T | null>(null);

  useEffect(() => {
    if (item === null) return;

    const release = () => setItem(null);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);

    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [item]);

  return { item, press: setItem };
}
