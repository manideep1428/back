"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignOutButton, useUser } from "@clerk/nextjs"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
    </svg>
  )
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m21 3-9.5 9.5M15.5 7.5l3 3M18 5l2 2" />
    </svg>
  )
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  )
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function LogOutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()

  const workspaceNav = [
    { name: "Overview", href: "/dashboard", icon: GridIcon },
    { name: "Usage", href: "/dashboard/usage", icon: ActivityIcon },
    { name: "Logs", href: "/dashboard/logs", icon: TerminalIcon },
    { name: "Documentation", href: "/docs", icon: BookOpenIcon },
  ]

  const accountNav = [
    { name: "API keys", href: "/dashboard/api-keys", icon: KeyIcon },
    { name: "Billing & plan", href: "/dashboard/billing", icon: CreditCardIcon },
    { name: "Payments", href: "/dashboard/payments", icon: ReceiptIcon },
    { name: "Referrals", href: "/dashboard/referrals", icon: UsersIcon },
  ]

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-[#060609] text-slate-100 font-sans">
        {/* SHADCN SIDEBAR WITH ICON COLLAPSIBLE */}
        <Sidebar collapsible="icon" className="border-r border-white/[0.06] bg-[#050508] text-slate-300">
          <SidebarHeader className="p-4 border-b border-white/[0.04]">
            <Link href="/" className="flex items-center gap-3 px-1 py-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px]">
                <div className="w-full h-full bg-[#0d0c15] rounded-[7px] flex items-center justify-center">
                  <CpuIcon className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="font-semibold text-white tracking-tight font-heading text-base">
                MakeThemBroke
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 space-y-6">
            {/* WORKSPACE GROUP */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono px-3 mb-2">
                WORKSPACE
              </SidebarGroupLabel>
              <SidebarMenu>
                {workspaceNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-purple-950/50 text-purple-300 border border-purple-500/30"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>

            {/* ACCOUNT GROUP */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono px-3 mb-2">
                ACCOUNT
              </SidebarGroupLabel>
              <SidebarMenu>
                {accountNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-purple-950/50 text-purple-300 border border-purple-500/30"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/[0.06] space-y-4">
            {/* Social links */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-[11px] font-mono text-slate-300 border border-white/[0.05] transition-colors"
              >
                <SendIcon className="w-3 h-3 text-sky-400" />
                <span>Telegram</span>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-[11px] font-mono text-slate-300 border border-white/[0.05] transition-colors"
              >
                <MessageSquareIcon className="w-3 h-3 text-indigo-400" />
                <span>Discord</span>
              </a>
            </div>

            {/* Clerk User Button Row */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <UserButton fallback={<div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white">M</div>} />
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">
                    {user?.fullName || user?.firstName || "Maxo Mythos"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user?.primaryEmailAddress?.emailAddress || "maxomythos@gmail.com"}
                  </div>
                </div>
              </div>

              <SignOutButton>
                <button className="text-slate-500 hover:text-slate-200 transition-colors p-1" title="Sign out">
                  <LogOutIcon className="w-3.5 h-3.5" />
                </button>
              </SignOutButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* SHADCN SIDEBAR INSET MAIN CONTENT */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-[#060609]">
          {/* Header Bar */}
          <header className="h-16 border-b border-white/[0.06] bg-[#060609]/90 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-400 hover:text-white" />
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Gateway operational</span>
              </div>
            </div>

            {/* Metric Badges */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/[0.04] border border-white/[0.06] text-slate-300">
                Pay-as-you-go
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold">
                🎁 BONUS $2.50
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold">
                💳 BALANCE $0.00
              </span>
            </div>
          </header>

          <main className="p-8 flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
