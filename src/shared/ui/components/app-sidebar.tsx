"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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
  SidebarRail,
  SidebarSeparator,
} from "@/shared/ui/components/ui/sidebar";
import {
  BookText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ScrollText,
  User2,
} from "lucide-react";
import { useTelegramAuth } from "@/shared/lib/use-telegram-auth";
import { useThemeStore, type ThemeMode } from "@/shared/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/ui/select";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { title: "Аккаунты", url: "/avito", icon: User2 },
  { title: "Объявления", url: "/ads", icon: ScrollText },
  { title: "Чаты", url: "/chats", icon: MessageSquare },
  { title: "База знаний", url: "/knowledge-base", icon: BookText },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-3 pb-1 px-2" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="px-0.5">
        <SidebarSeparator className="mx-0" />
      </div>

      <SidebarFooter>
        <ProfileFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function ProfileFooter() {
  const { authData } = useTelegramAuth();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { mode, setMode } = useThemeStore();

  const firstName = authData?.user.firstName ?? "";
  const lastName = authData?.user.lastName ?? "";
  const username = authData?.user.username;
  const photoUrl = authData?.user.photoUrl;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Пользователь";

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;

      const isSelectClick = (target as Element).closest(
        '[data-slot="select-content"]'
      );

      if (!containerRef.current.contains(target) && !isSelectClick) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* При свёрнутом сайдбаре показываем только аватар без кнопки */}
      <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
        <Avatar photoUrl={photoUrl} name={fullName} />
      </div>

      {/* При развёрнутом сайдбаре показываем полную кнопку с текстом */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:hidden"
      >
        <Avatar photoUrl={photoUrl} name={fullName} />
        <div className="min-w-0 flex-1 text-left leading-tight">
          <div className="truncate text-sm font-medium">{fullName}</div>
          {username ? (
            <div className="truncate text-xs opacity-70">@{username}</div>
          ) : null}
        </div>
        {open ? (
          <ChevronUp className="shrink-0" />
        ) : (
          <ChevronDown className="shrink-0" />
        )}
      </button>

      {open ? (
        <div className="bg-sidebar text-sidebar-foreground border-sidebar-border absolute bottom-12 left-2 right-2 z-50 rounded-md border shadow-sm">
          <div className="flex items-center gap-3 p-3">
            <Avatar size={36} photoUrl={photoUrl} name={fullName} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{fullName}</div>
              {username ? (
                <div className="truncate text-xs opacity-70">@{username}</div>
              ) : null}
            </div>
          </div>
          <SidebarSeparator className="mx-0" />
          <div className="p-1">
            <MenuRow label="Биллинг" />
            <MenuRow label="Уведомления" />
            <SidebarSeparator className="my-1" />
            <div className="px-2 py-2">
              <label className="text-sidebar-foreground text-xs font-medium mb-1.5 block">
                Тема
              </label>
              <Select
                value={mode}
                onValueChange={(value) => setMode(value as ThemeMode)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="right" align="start">
                  <SelectItem value="auto">Авто (Telegram)</SelectItem>
                  <SelectItem value="light">Светлая</SelectItem>
                  <SelectItem value="dark">Темная</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({
  photoUrl,
  name,
  size = 28,
}: {
  photoUrl?: string;
  name: string;
  size?: number;
}) {
  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/);
    const a = (parts[0]?.[0] ?? "").toUpperCase();
    const b = (parts[1]?.[0] ?? "").toUpperCase();
    return a + b || "U";
  }, [name]);

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-md object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className="bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center rounded-md text-xs font-medium"
    >
      {initials}
    </div>
  );
}

function MenuRow({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center rounded-md px-2 py-2 text-sm"
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
