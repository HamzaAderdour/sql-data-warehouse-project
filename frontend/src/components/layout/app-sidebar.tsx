import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  TrendingUp,
  Globe2,
  Package,
  Users,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, group: "Overview" },
  { title: "Sales Analytics", url: "/sales", icon: TrendingUp, group: "Analytics" },
  { title: "Market Intelligence", url: "/markets", icon: Globe2, group: "Analytics" },
  { title: "Product Intelligence", url: "/products", icon: Package, group: "Analytics" },
  { title: "Customer Intelligence", url: "/customers", icon: Users, group: "Analytics" },
  { title: "Executive Insights", url: "/insights", icon: Lightbulb, group: "Strategy" },
] as const;

const groups = ["Overview", "Analytics", "Strategy"] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-tight text-sidebar-foreground">Sales Intelligence</span>
            <span className="text-xs text-sidebar-foreground/60">Decision Support</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems
                  .filter((i) => i.group === group)
                  .map((item) => {
                    const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1.5 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          v1.0 · BI Platform
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
