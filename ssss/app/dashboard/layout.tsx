"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignOutButton, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
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

function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
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
      <rect x="2" y="5" width="20" height="14" rx="2" />
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
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" />
      <path d="M16 12h5a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1z" />
    </svg>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const stats = useQuery(api.userStats.getUserStats) || {
    bonusUsd: 2.5,
    balanceUsd: 0.0,
  }

  const workspaceNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
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
        <Sidebar collapsible="icon" className="border-r border-white/[0.06] bg-[#050508] text-slate-300">
          <SidebarHeader className="p-4 border-b border-white/[0.04] group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <Link href="/" className="flex items-center gap-3 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px] shrink-0">
                <div className="w-full h-full bg-[#0d0c15] rounded-[7px] flex items-center justify-center">
                  <CpuIcon className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <span className="font-semibold text-white tracking-tight font-heading text-base truncate group-data-[collapsible=icon]:hidden">
                MakeThemBroke
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4 space-y-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:space-y-4">
            <SidebarGroup className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono px-3 mb-2 group-data-[collapsible=icon]:hidden">
                WORKSPACE
              </SidebarGroupLabel>
              <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:w-full">
                {workspaceNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.name}
                        render={<Link href={item.href} />}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto ${
                          isActive
                            ? "bg-purple-950/50 text-purple-300 border border-purple-500/30 font-semibold"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono px-3 mb-2 group-data-[collapsible=icon]:hidden">
                ACCOUNT
              </SidebarGroupLabel>
              <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:w-full">
                {accountNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.name}
                        render={<Link href={item.href} />}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto ${
                          isActive
                            ? "bg-purple-950/50 text-purple-300 border border-purple-500/30 font-semibold"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-white/[0.06] group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:mx-auto">
              <div className="flex items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:justify-center">
                <UserButton fallback={<div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white">M</div>} />
                <div className="truncate group-data-[collapsible=icon]:hidden">
                  <div className="text-xs font-medium text-white truncate">
                    {user?.fullName || user?.firstName || "Developer"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user?.primaryEmailAddress?.emailAddress || "dev@makethembroke.com"}
                  </div>
                </div>
              </div>

              <SignOutButton>
                <button className="text-slate-500 hover:text-slate-200 transition-colors p-1 group-data-[collapsible=icon]:hidden" title="Sign out">
                  <LogOutIcon className="w-3.5 h-3.5" />
                </button>
              </SignOutButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-[#060609]">
          <header className="h-16 border-b border-white/[0.06] bg-[#060609]/90 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-400 hover:text-white" />
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                <span>Gateway operational</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/[0.04] border border-white/[0.06] text-slate-300">
                Pay-as-you-go
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 font-medium flex items-center gap-1.5">
                <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>BALANCE ${((stats.balanceUsd || 0.0) + (stats.bonusUsd !== undefined ? stats.bonusUsd : 2.50)).toFixed(2)}</span>
              </span>
            </div>
          </header>

          <main className="p-8 flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
