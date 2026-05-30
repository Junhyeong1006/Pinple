import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, List, PenSquare } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: '지도', icon: Map },
    { path: '/list', label: '목록', icon: List },
    { path: '/create', label: '글쓰기', icon: PenSquare },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 glass shadow-sm transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="pinple-logo">🗺️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-sky-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-sky-400">
            Pinple
          </span>
        </Link>
        
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-6 flex flex-col">
        {children}
      </main>

      {/* Bottom Floating Navigation for Mobile */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md h-16 rounded-full glass-nav glass shadow-xl flex items-center justify-around px-4 transition-transform duration-300 md:bottom-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 h-full relative group"
            >
              <div
                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-500 -translate-y-2.5 scale-110 shadow-md shadow-violet-500/5 ring-1 ring-violet-500/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-violet-400 dark:hover:text-violet-400'
                }`}
              >
                <Icon size={20} className="transition-transform duration-200 group-active:scale-90" />
              </div>
              <span
                className={`text-[10px] font-semibold transition-all duration-300 absolute bottom-1.5 ${
                  isActive 
                    ? 'opacity-100 text-violet-500 translate-y-0' 
                    : 'opacity-0 text-zinc-400 translate-y-2'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
