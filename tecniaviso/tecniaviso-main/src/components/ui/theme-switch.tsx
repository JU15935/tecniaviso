import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ThemeSwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeSwitch = ({ className, isDark, onToggle, ...props }: ThemeSwitchProps) => {
  const handleCheckedChange = useCallback(
    (isChecked: boolean) => {
      if (isChecked !== isDark) onToggle();
    },
    [isDark, onToggle],
  );

  return (
    <div className={cn("relative inline-flex items-center", className)} {...props}>
      {/* Wide pill switch track */}
      <Switch
        checked={isDark}
        onCheckedChange={handleCheckedChange}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className={cn(
          "h-8 w-[72px] rounded-full border border-border transition-colors duration-300",
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
          // thumb overrides
          "[&>span]:h-6 [&>span]:w-6 [&>span]:rounded-full [&>span]:bg-background [&>span]:shadow-md [&>span]:z-10",
          "data-[state=unchecked]:[&>span]:translate-x-1",
          "data-[state=checked]:[&>span]:translate-x-[40px]",
        )}
      />

      {/* Sun icon — left side (light mode) */}
      <span className="pointer-events-none absolute left-[8px] flex items-center justify-center">
        <SunIcon
          size={13}
          className={cn(
            "transition-opacity duration-300",
            isDark ? "opacity-30 text-primary-foreground" : "opacity-80 text-warning",
          )}
        />
      </span>

      {/* Moon icon — right side (dark mode) */}
      <span className="pointer-events-none absolute right-[8px] flex items-center justify-center">
        <MoonIcon
          size={13}
          className={cn(
            "transition-opacity duration-300",
            isDark ? "opacity-90 text-primary-foreground" : "opacity-30 text-muted-foreground",
          )}
        />
      </span>
    </div>
  );
};

export default ThemeSwitch;
