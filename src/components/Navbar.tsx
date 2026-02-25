'use client'
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutGrid,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Home,
    Layers,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { useClerk, useUser, OrganizationSwitcher } from '@clerk/nextjs'

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutGrid size={16} /> },
    { label: 'Templates', href: '/templates', icon: <Layers size={16} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={16} /> },
]

const Navbar = () => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
    const pathname = usePathname()
    const router = useRouter()
    const { signOut } = useClerk()
    const { user } = useUser()

    const isActive = (href: string) => pathname === href || pathname.startsWith(href)

    return (
        <div
            className={`
        relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-200 ease-in-out flex-shrink-0
        ${isCollapsed ? 'w-[52px]' : 'w-[220px]'}
      `}
        >
            {/* Logo */}
            <div
                className={`
          flex items-center gap-2.5 px-3 py-4 border-b border-sidebar-border
          ${isCollapsed ? 'justify-center' : ''}
        `}
            >
                <Logo size={28} className="flex-shrink-0" />
                {!isCollapsed && (
                    <span className="text-sm font-bold text-sidebar-foreground tracking-tight animate-fadeIn">
                        MockBird
                    </span>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className={`
              flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm w-full text-left
              transition-all duration-100 cursor-pointer
              ${isCollapsed ? 'justify-center' : ''}
              ${isActive(item.href)
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                            }
            `}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <span className={isActive(item.href) ? 'text-primary' : ''}>{item.icon}</span>
                        {!isCollapsed && <span className="animate-fadeIn">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Org Switcher: uncomment and fix later based on the requirements */}
            {/* <div className={`px-2 py-2 border-b border-sidebar-border ${isCollapsed ? 'flex justify-center' : ''}`}>
                {!isCollapsed ? (
                    <OrganizationSwitcher
                        hidePersonal={false}
                        afterCreateOrganizationUrl="/dashboard"
                        afterSelectOrganizationUrl="/dashboard"
                        appearance={{
                            elements: {
                                rootBox: 'w-full',
                                organizationSwitcherTrigger:
                                    'w-full rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-1.5 text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                            },
                        }}
                    />
                ) : (
                    <OrganizationSwitcher
                        hidePersonal={false}
                        afterCreateOrganizationUrl="/dashboard"
                        afterSelectOrganizationUrl="/dashboard"
                        appearance={{
                            elements: {
                                rootBox: 'w-full flex justify-center',
                                organizationSwitcherTrigger:
                                    'rounded-md border border-sidebar-border bg-sidebar-accent/40 p-1.5 text-xs text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                                organizationSwitcherTriggerIcon: 'mx-0',
                            },
                        }}
                    />
                )}
            </div> */}

            {/* Bottom: User + Collapse */}
            <div className="p-2 border-t border-sidebar-border flex flex-col gap-1">
                {/* User */}
                {user && (
                    <div
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {user.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt="avatar"
                                className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-primary">
                                    {(user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
                                </span>
                            </div>
                        )}
                        {!isCollapsed && (
                            <span className="text-xs text-sidebar-foreground/70 truncate max-w-[120px] animate-fadeIn">
                                {user.firstName || user.emailAddresses?.[0]?.emailAddress}
                            </span>
                        )}
                    </div>
                )}

                {/* Sign Out */}
                <button
                    onClick={() => signOut({ redirectUrl: '/auth/login' })}
                    className={`
            flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm w-full
            text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10
            transition-all duration-100 cursor-pointer
            ${isCollapsed ? 'justify-center' : ''}
          `}
                    title={isCollapsed ? 'Sign out' : undefined}
                >
                    <LogOut size={14} />
                    {!isCollapsed && <span className="animate-fadeIn">Sign out</span>}
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
            flex items-center justify-center px-2.5 py-2 rounded-md text-sm w-full
            text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/60
            transition-all duration-100 cursor-pointer
          `}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : (
                        <div className="flex items-center gap-2 w-full">
                            <ChevronLeft size={14} />
                            <span className="text-xs animate-fadeIn">Collapse</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    )
}

export default Navbar