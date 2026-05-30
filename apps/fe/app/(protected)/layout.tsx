export const dynamic = "force-dynamic"

import { DynamicBreadcrumbs } from "@/components/layout/dynamic-breadcrumbs"
import { CurrentUserProvider } from "@/components/providers/current-user-provider"
import { SearchProvider } from "@/components/providers/search-conversation-provider"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireCurrentUser } from "@/lib/server-auth"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireCurrentUser()

  return (
    <CurrentUserProvider user={user}>
      <SearchProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="relative h-svh overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                />
                <DynamicBreadcrumbs />
              </div>
            </header>
            <div className="@container/main relative flex h-full flex-col gap-4 overflow-scroll">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </SearchProvider>
    </CurrentUserProvider>
  )
}
