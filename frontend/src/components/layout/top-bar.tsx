import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Moon, Search, Sun, Database } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme-provider";
import { useIsDemoMode } from "@/lib/api/demo-store";
import { useCountries, usePareto } from "@/hooks/use-sales-data";

const pages = [
  { title: "Dashboard", to: "/" },
  { title: "Sales Analytics", to: "/sales" },
  { title: "Market Intelligence", to: "/markets" },
  { title: "Product Intelligence", to: "/products" },
  { title: "Customer Intelligence", to: "/customers" },
  { title: "Executive Insights", to: "/insights" },
] as const;

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const isDemo = useIsDemoMode();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: countries } = useCountries();
  const { data: products } = usePareto();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="outline"
        className="h-9 w-full max-w-xs justify-start gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search markets, products…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 text-[10px] font-medium sm:inline">⌘K</kbd>
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {isDemo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 border-warning/50 bg-warning/10 text-warning-foreground dark:text-warning">
                <Database className="h-3 w-3" /> Demo Data
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[220px] text-xs">
                The API at the configured base URL is unreachable. Showing bundled sample data.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, countries, products…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem
                key={p.to}
                value={`page ${p.title}`}
                onSelect={() => {
                  navigate({ to: p.to });
                  setOpen(false);
                }}
              >
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {countries && countries.length > 0 && (
            <CommandGroup heading="Markets">
              {countries.slice(0, 6).map((c) => (
                <CommandItem
                  key={c.country}
                  value={`market ${c.country}`}
                  onSelect={() => {
                    navigate({ to: "/markets" });
                    setOpen(false);
                  }}
                >
                  {c.country}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {products && products.length > 0 && (
            <CommandGroup heading="Top Products">
              {products.slice(0, 6).map((p) => (
                <CommandItem
                  key={p.product_key}
                  value={`product ${p.product_name}`}
                  onSelect={() => {
                    navigate({ to: "/products" });
                    setOpen(false);
                  }}
                >
                  {p.product_name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
