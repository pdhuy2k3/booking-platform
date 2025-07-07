import type React from "react"
import { AuthGuard } from "@/components/auth-guard"

export default function PartnerLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard requiredRole="partner">{children}</AuthGuard>
}
