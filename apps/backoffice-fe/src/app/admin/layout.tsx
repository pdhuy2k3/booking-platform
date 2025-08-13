import type React from "react"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requiredRole="admin">{children}</AuthGuard>
}
