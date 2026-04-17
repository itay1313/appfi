import { Sun, Moon, Monitor, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="size-5 text-primary-foreground" fill="none">
              {/* Star / sparkle shape */}
              <path
                d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
                fill="currentColor"
                opacity="0.9"
              />
              <circle cx="19" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
              <circle cx="5" cy="19" r="1" fill="currentColor" opacity="0.4" />
            </svg>
          </div>

          {/* Brand text */}
          <div className="flex flex-col">
            <span className="text-[15px] font-extrabold leading-tight tracking-tight text-foreground">
              ItayReview
            </span>
            <span className="text-[10.5px] font-medium leading-tight text-muted-foreground">
              Where reviews meet insight ✦
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/top-apps"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LayoutGrid className="size-3.5" />
            Top Apps
          </Link>

          <DropdownMenu>
          <DropdownMenuTrigger className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            {theme === "dark" ? (
              <Moon className="size-[18px]" />
            ) : theme === "light" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Monitor className="size-[18px]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 size-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 size-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 size-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
