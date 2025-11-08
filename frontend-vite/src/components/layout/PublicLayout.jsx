import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

/**
 * A layout for all public-facing pages (Landing, Login, Register).
 * Includes a shared header and footer.
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <Outlet /> {/* This renders LandingPage, LoginPage, etc. */}
      </main>
      <PublicFooter />
    </div>
  );
}