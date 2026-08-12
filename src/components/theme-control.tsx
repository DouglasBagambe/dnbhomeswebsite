"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";
const options = [["system", Monitor, "System"], ["light", Sun, "Light"], ["dark", Moon, "Dark"]] as const;
const themeEvent = "homes-theme-change";

function readTheme(): Theme {
  const saved = localStorage.getItem("homes-theme");
  return saved === "light" || saved === "dark" ? saved : "system";
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(themeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(themeEvent, onChange);
  };
}
const serverTheme = (): Theme => "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  root.dataset.theme = theme;
  root.dataset.resolvedTheme = resolved;
  root.style.colorScheme = resolved;
}

export function ThemeControl() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  useEffect(() => {
    applyTheme(theme);
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => theme === "system" && applyTheme("system");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);
  const choose = (next: Theme) => { localStorage.setItem("homes-theme", next); applyTheme(next); window.dispatchEvent(new Event(themeEvent)); };
  return <div className="theme-setting"><span>Theme</span><div className="theme-control" role="group" aria-label="Colour theme">
    {options.map(([value, Icon, label]) => <button key={value} type="button" className={theme === value ? "active" : ""} aria-pressed={theme === value} onClick={() => choose(value)}><Icon size={15} /><span>{label}</span></button>)}
  </div></div>;
}
