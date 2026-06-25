import Link from "next/link"
import { Home } from "lucide-react"

interface AuthPageShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footerText?: string
  footerLinkHref?: string
  footerLinkText?: string
}

export function AuthPageShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkHref,
  footerLinkText,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)] flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Home className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <span className="font-serif text-lg italic text-foreground">RentFlow</span>
            <p className="text-[10px] text-primary font-semibold tracking-widest uppercase">
              Hogares de Autor
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border-t-4 border-t-primary shadow-sm p-10">
            <h1 className="font-serif text-4xl text-foreground mb-1">{title}</h1>
            <p className="text-[11px] text-muted-foreground tracking-widest uppercase mb-8">
              {subtitle}
            </p>

            {children}

            {footerText && footerLinkHref && footerLinkText ? (
              <p className="text-center text-sm text-muted-foreground mt-8">
                {footerText}{" "}
                <Link href={footerLinkHref} className="text-primary font-bold hover:underline">
                  {footerLinkText}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
