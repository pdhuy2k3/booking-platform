"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-xl text-foreground">BookingSmart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/flights"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Flights
          </Link>
          <Link
            href="/hotels"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Hotels
          </Link>
          <Link
            href="/packages"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Packages
          </Link>
          <Link
            href="/my-bookings"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            My Bookings
          </Link>
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/oauth2/authorization/storefront-client">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/oauth2/authorization/storefront-client">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                <Link
                  href="/flights"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  Flights
                </Link>
                <Link
                  href="/hotels"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  Hotels
                </Link>
                <Link
                  href="/packages"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  Packages
                </Link>
                <Link
                  href="/my-bookings"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  My Bookings
                </Link>
                <div className="pt-4 border-t space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/oauth2/authorization/storefront-client">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/oauth2/authorization/storefront-client">Sign Up</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
