'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, MessageSquare, FileText, Users, BookOpen, FileEdit, LogOut, ArrowLeft, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signout } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  userEmail: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarCollapsed')
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState))
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    {
      href: '/admin',
      icon: LayoutDashboard,
      label: 'ダッシュボード',
    },
    {
      href: '/admin/chats',
      icon: MessageSquare,
      label: 'チャット',
    },
    {
      href: '/admin/responses',
      icon: FileText,
      label: '返信管理',
    },
    {
      href: '/admin/discord-messages',
      icon: MessageCircle,
      label: 'Discordメッセージ',
    },
    {
      href: '/admin/users',
      icon: Users,
      label: '会員管理',
    },
    {
      href: '/admin/courses',
      icon: BookOpen,
      label: 'コース管理',
    },
    {
      href: '/admin/posts',
      icon: FileEdit,
      label: '投稿管理',
    },
    {
      href: '/admin/post-feedback',
      icon: FileText,
      label: '投稿フィードバック',
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
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                SAKIYOMI
              </h1>
              <p className="text-sm text-gray-500 font-medium">Admin Panel</p>
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
            <a
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center text-base font-semibold rounded-xl transition-all duration-200 group",
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
            </a>
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
        <a
          href="/dashboard"
          title={isCollapsed ? "一般画面へ" : undefined}
          className={cn(
            "flex items-center font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200",
            isCollapsed
              ? "justify-center p-3"
              : "justify-center gap-3 w-full px-5 py-3.5 text-base"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          {!isCollapsed && <span>一般画面へ</span>}
        </a>
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
