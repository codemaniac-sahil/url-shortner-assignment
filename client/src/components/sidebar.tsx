import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Link2, 
  BarChart3, 
  ExternalLink, 
  Tags, 
  Settings,
  User,
  X
} from "lucide-react";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, current: location === '/' },
    { name: 'My Links', href: '/', icon: ExternalLink, current: false },
    { name: 'Tags', href: '/', icon: Tags, current: false },
    { name: 'Analytics', href: '/', icon: BarChart3, current: false },
    { name: 'Settings', href: '/', icon: Settings, current: false },
  ];

  const sidebarContent = (
    <>
      <div className="flex flex-col flex-grow pt-5 bg-secondary overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link2 className="text-primary h-6 w-6" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white">LinkShrink</h1>
              <p className="text-slate-400 text-sm">URL Analytics</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex-1 flex flex-col">
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    item.current
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700",
                    "w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-slate-600 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs font-medium text-slate-400">john@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
