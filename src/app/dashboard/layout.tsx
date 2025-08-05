"use client"

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SidebarNav } from '@/components/sidebar-nav'
import { ProtectedLayout } from '@/context/auth-context';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedLayout>
      <SidebarProvider>
        <SidebarNav />
        <SidebarInset>
          <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedLayout>
  )
}
