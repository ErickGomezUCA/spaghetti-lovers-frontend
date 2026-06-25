"use client"

import Link from "next/link"
import { Home, Headphones } from "lucide-react"

interface HeaderProps {
  showSupport?: boolean
}

export function Header({ showSupport = true }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card">
          <Home className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold italic text-foreground">RentFlow</span>
          <span className="text-xs font-medium tracking-wider text-primary uppercase">Hogares de Autor</span>
        </div>
      </Link>
    </header>
  )
}
