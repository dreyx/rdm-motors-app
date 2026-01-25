import type { Metadata } from "next"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  robots: "noindex, nofollow", // Prevent search engines from indexing the admin page
}

export const dynamic = "force-dynamic"

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <AdminDashboard />
        </div>
      </main>
      <Footer />
    </div>
  )
}
