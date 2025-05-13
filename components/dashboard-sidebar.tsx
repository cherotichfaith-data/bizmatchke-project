"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Lightbulb, Bookmark, BookOpen, User, LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Generate Ideas",
      icon: Lightbulb,
      href: "/dashboard/idea-generator",
    },
    {
      title: "Saved Ideas",
      icon: Bookmark,
      href: "/dashboard/saved-ideas",
    },
    {
      title: "Resources",
      icon: BookOpen,
      href: "/dashboard/resources",
    },
    {
      title: "My Profile",
      icon: User,
      href: "/dashboard/profile",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/logo-white.png"
                alt="BizMatchKE Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/20 p-1 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <span className="text-foreground text-sm font-medium">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <div className="p-4 md:hidden flex items-center justify-between border-b border-border">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/logo-white.png"
                alt="BizMatchKE Logo"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
