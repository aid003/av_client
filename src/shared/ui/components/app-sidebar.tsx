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
  useSidebar,
} from "@/shared/ui/components/ui/sidebar";
import {
  Bell,
  BookText,
  ChevronDown,
  ChevronUp,
  FileCode,
  MessageSquare,
  PlayCircle,
  ScrollText,
  Settings,
  User2,
  Users,
} from "lucide-react";
import { useTelegramAuth } from "@/shared/lib/use-telegram-auth";
import { useNotificationStore, NotificationBadge } from "@/entities/notification";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { title: "Гайд", url: "/", icon: PlayCircle },
  { title: "Аккаунты", url: "/avito", icon: User2 },
  { title: "Объявления", url: "/ads", icon: ScrollText },
  { title: "Чаты", url: "/chats", icon: MessageSquare },
  { title: "Лиды", url: "/leads", icon: Users },
  { title: "База знаний", url: "/knowledge-base", icon: BookText },
  { title: "Скрипты продаж", url: "/sales-scripts", icon: FileCode },
];

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const mobileMenuItemClassName = isMobile
    ? "h-11 px-3 text-base gap-3 [&>svg]:size-5"
    : undefined;

  return (
    <Sidebar collapsible="icon">
      {/* На мобильном добавляем больший отступ сверху для Telegram header */}
      <SidebarHeader 
        className="pb-1 px-2"
        style={{
          paddingTop: isMobile 
            ? 'max(4rem, calc(env(safe-area-inset-top, 0px) + 2.5rem))' 
            : '0.75rem'
        }}
      />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={mobileMenuItemClassName}
                  >
                    <Link href={item.url} onClick={handleMenuItemClick}>
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
  const { isMobile, setOpenMobile } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const tenantId = authData?.tenant.id;

  // Прямая подписка на unreadCount для правильной реактивности
  const unreadCount = useNotificationStore(
    (state) => (tenantId ? state.unreadCountByTenant[tenantId] || 0 : 0)
  );

  const firstName = authData?.user.firstName ?? "";
  const lastName = authData?.user.lastName ?? "";
  const username = authData?.user.username;
  const photoUrl = authData?.user.photoUrl;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "Пользователь";

  const handleFooterLinkClick = () => {
    setOpen(false);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
        <Avatar photoUrl={photoUrl} name={fullName} showBadge={true} badgeCount={unreadCount} />
      </div>

      {/* При развёрнутом сайдбаре показываем полную кнопку с текстом */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:hidden"
      >
        <Avatar photoUrl={photoUrl} name={fullName} showBadge={true} badgeCount={unreadCount} />
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
          <div className="p-1">
            <Link
              href="/notifications"
              onClick={handleFooterLinkClick}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="flex-1">Уведомления</span>
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <SidebarSeparator className="my-1" />
            <Link
              href="/settings"
              onClick={handleFooterLinkClick}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="flex-1">Настройки</span>
            </Link>
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
  showBadge = false,
  badgeCount = 0,
}: {
  photoUrl?: string;
  name: string;
  size?: number;
  showBadge?: boolean;
  badgeCount?: number;
}) {
  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/);
    const a = (parts[0]?.[0] ?? "").toUpperCase();
    const b = (parts[1]?.[0] ?? "").toUpperCase();
    return a + b || "U";
  }, [name]);

  const avatarElement = photoUrl ? (
    <Image
      src={photoUrl}
      alt={name}
      width={size}
      height={size}
      className="rounded-md object-cover"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className="bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center rounded-md text-xs font-medium"
    >
      {initials}
    </div>
  );

  if (showBadge && badgeCount > 0) {
    return (
      <div className="relative">
        {avatarElement}
        <NotificationBadge count={badgeCount} />
      </div>
    );
  }

  return avatarElement;
}
