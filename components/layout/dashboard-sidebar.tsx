'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, MessageSquare, Users, User, Instagram, Bell, Shield, LogOut, FileText, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { signout } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  userEmail: string
  isAdmin: boolean
  unreadCount: number
  totalChatUnreadCount: number
}

export function DashboardSidebar({
  userEmail,
  isAdmin,
  unreadCount,
  totalChatUnreadCount
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'ダッシュボード',
    },
    {
      href: '/dashboard/courses',
      icon: BookOpen,
      label: 'コース',
    },
    {
      href: '/dashboard/chats',
      icon: MessageSquare,
      label: 'チャット',
      badge: totalChatUnreadCount,
    },
    {
      href: '/dashboard/community',
      icon: Users,
      label: 'コミュニティ',
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: 'プロフィール',
    },
    {
      href: '/dashboard/instagram',
      icon: Instagram,
      label: 'Instagram',
    },
    {
      href: '/dashboard/post-feedback',
      icon: FileText,
      label: '投稿フィードバック',
    },
    {
      href: '/dashboard/notifications',
      icon: Bell,
      label: '通知',
      badge: unreadCount,
    },
  ]

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 flex flex-col shadow-lg transition-all duration-300",
      isCollapsed ? "w-20" : "w-80"
    )}>
      {/* Logo Section with Toggle Button */}
      <div className={cn(
        "border-b border-gray-200 relative",
        isCollapsed ? "p-4" : "p-8"
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "gap-4"
        )}>
          <div className="p-3 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl shadow-md">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SAKIYOMI
              </h1>
              <p className="text-sm text-gray-500 font-medium">学習プラットフォーム</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -right-3 bg-white border border-gray-200 rounded-full p-1 h-6 w-6 hover:bg-gray-100 shadow-md z-10",
            isCollapsed && "right-2"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className={cn(
        "flex-1 overflow-y-auto space-y-2",
        isCollapsed ? "p-2" : "p-5"
      )}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center text-base font-semibold rounded-xl transition-all duration-200 group relative",
                active
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
                isCollapsed
                  ? "justify-center p-3"
                  : "gap-4 px-5 py-4"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                active ? 'text-white' : ''
              )} />
              {!isCollapsed && <span>{item.label}</span>}

              {/* Badge positioning for both states */}
              {item.badge && item.badge > 0 && (
                <Badge
                  variant="destructive"
                  className={cn(
                    "absolute h-5 w-5 p-0 flex items-center justify-center text-xs",
                    active ? 'bg-white text-orange-600' : 'animate-pulse',
                    isCollapsed
                      ? "top-1 right-1 text-[10px]"
                      : "top-3 right-4 h-6 w-6"
                  )}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn(
        "border-t border-gray-200 space-y-3",
        isCollapsed ? "p-2" : "p-5"
      )}>
        {/* User Info - show only when expanded */}
        {!isCollapsed && (
          <div className="px-5 py-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">ログイン中</p>
            <p className="text-base text-gray-900 truncate font-medium">{userEmail}</p>
          </div>
        )}

        {/* Action Buttons */}
        {isAdmin && (
          <a
            href="/admin"
            title={isCollapsed ? "管理者画面" : undefined}
            className={cn(
              "flex items-center font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg",
              isCollapsed
                ? "justify-center p-3"
                : "justify-center gap-3 w-full px-5 py-3.5 text-base"
            )}
          >
            <Shield className="w-4 h-4" />
            {!isCollapsed && <span>管理者画面</span>}
          </a>
        )}
        <form action={signout} className="w-full">
          <Button
            variant="outline"
            size="sm"
            type="submit"
            title={isCollapsed ? "ログアウト" : undefined}
            className={cn(
              "font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 transition-all duration-200 rounded-xl",
              isCollapsed
                ? "flex items-center justify-center p-3 w-full"
                : "w-full px-5 py-3.5 text-base flex items-center justify-center"
            )}
          >
            <LogOut className={cn(
              "w-4 h-4",
              !isCollapsed && "mr-2"
            )} />
            {!isCollapsed && "ログアウト"}
          </Button>
        </form>
      </div>
    </aside>
  )
}
