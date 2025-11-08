import React from 'react';
import { CreditCard } from 'lucide-react'; // Changed from Package

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-primary stroke-2" />
          <span className="text-xl font-extrabold text-foreground">PayGen</span>
        </div>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} PayGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}