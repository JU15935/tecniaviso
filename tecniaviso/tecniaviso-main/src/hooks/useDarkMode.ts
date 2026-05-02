import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);

  return { dark, toggle: () => {} };
}
