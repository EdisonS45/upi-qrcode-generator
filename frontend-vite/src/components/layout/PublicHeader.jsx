import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react'; // Changed from Package to CreditCard
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';

// Updated Logo Component
const Logo = () => (
  <Link to="/" className="flex items-center space-x-2">
    {/* A more abstract icon for a tech SaaS */}
    <CreditCard className="h-6 w-6 text-primary stroke-2" /> 
    <span className="text-xl font-extrabold text-foreground">PayGen</span>
  </Link>
);

export default function PublicHeader() {
  const scrolled = useScroll();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-sm" // Added backdrop-blur
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center space-x-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <Button onClick={() => navigate('/app/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="hover:text-primary">
                Log In
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-white">
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}