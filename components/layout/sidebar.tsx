"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/db/schema"
import { signOut } from "@/app/actions/auth"
import {
  LayoutGrid,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  MoreVertical,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// ----------------------------------------------------------------------
// 1. 配置项
// ----------------------------------------------------------------------

interface SidebarProps {
  user: User
  className?: string
}

const NAV_LINKS = [
  { href: "/projects", label: "项目看板", icon: LayoutGrid },
  { href: "/projects/trash", label: "回收站", icon: Trash2 },
  { href: "/settings", label: "系统设置", icon: Settings },
]

// ----------------------------------------------------------------------
// 2. 主组件出口 (包含移动端和桌面端逻辑)
// ----------------------------------------------------------------------

export function Sidebar({ user, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // 桌面端侧边栏
  const DesktopSidebar = (
    <aside
      className={cn(
        "group/sidebar relative hidden h-full flex-col border-r bg-card/50 text-card-foreground transition-all duration-300 ease-in-out md:flex",
        isCollapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      {/* 桌面端内容 */}
      <SidebarContent 
        user={user} 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      
      {/* 折叠切换按钮 (悬浮在边缘) */}
      <div className="absolute -right-3 top-8 z-20 opacity-0 transition-opacity group-hover/sidebar:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
    </aside>
  )

  // 移动端侧边栏 (抽屉)
  const MobileSidebar = (
    <div className="flex items-center p-4 md:hidden">
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
             <SheetTitle>导航菜单</SheetTitle>
          </SheetHeader>
          <div className="h-full py-4">
             <SidebarContent user={user} isCollapsed={false} isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <>
      {MobileSidebar}
      {DesktopSidebar}
    </>
  )
}

// ----------------------------------------------------------------------
// 3. 侧边栏内部内容组件
// ----------------------------------------------------------------------

interface SidebarContentProps {
  user: User
  isCollapsed: boolean
  toggleCollapse?: () => void
  isMobile?: boolean
}

function SidebarContent({ user, isCollapsed, isMobile = false }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo 区域 */}
      <div className={cn(
        "flex h-16 items-center border-b px-4 transition-all duration-300",
        isCollapsed ? "justify-center px-2" : "justify-start"
      )}>
        <div className="flex items-center gap-2 font-bold text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg">N</span>
          </div>
          {!isCollapsed && <span className="text-lg tracking-tight text-foreground">Nexis</span>}
        </div>
      </div>

      {/* 导航区域 */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 py-4 px-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <SidebarItem
                key={link.href}
                icon={link.icon}
                label={link.label}
                href={link.href}
                isActive={isActive}
                isCollapsed={isCollapsed}
              />
            )
          })}
        </nav>
      </TooltipProvider>

      {/* 底部用户区域 */}
      <div className="mt-auto border-t p-2">
        <UserMenu user={user} isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// 4. 单个导航项组件 (自动处理 Tooltip)
// ----------------------------------------------------------------------

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  href: string
  isActive: boolean
  isCollapsed: boolean
}

function SidebarItem({ icon: Icon, label, href, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
            isActive 
              ? "bg-primary/10 text-primary hover:bg-primary/15" 
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive && "text-primary")} />
          {!isCollapsed && (
            <span className="animate-in fade-in zoom-in-95 duration-200">
              {label}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      {/* 仅在折叠状态下显示 Tooltip */}
      {isCollapsed && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

// ----------------------------------------------------------------------
// 5. 用户菜单组件 (Dropdown 风格)
// ----------------------------------------------------------------------

function UserMenu({ user, isCollapsed }: { user: User; isCollapsed: boolean }) {
  const userInitials = user.email?.[0].toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 px-2 py-6 hover:bg-muted/50 data-[state=open]:bg-muted",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Avatar className="h-8 w-8 cursor-pointer rounded-lg border bg-muted">
             <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
               {userInitials}
             </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex flex-1 flex-col items-start text-left text-sm">
              <span className="truncate w-32 font-medium text-foreground">
                {user.email?.split('@')[0]}
              </span>
              <span className="truncate w-32 text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          )}
          
          {!isCollapsed && <MoreVertical className="h-4 w-4 text-muted-foreground ml-auto" />}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-56" 
        align="end" 
        side={isCollapsed ? "right" : "top"} 
        sideOffset={isCollapsed ? 20 : 10}
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{user.email}</p>
            <p className="w-[200px] truncate text-xs text-muted-foreground">用户中心</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>设置</span>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* 退出登录 Form */}
        <DropdownMenuItem asChild className="text-red-600 focus:text-red-600 focus:bg-red-50">
            <form action={signOut} className="w-full">
                <button type="submit" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                </button>
            </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}