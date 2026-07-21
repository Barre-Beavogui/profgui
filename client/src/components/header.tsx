import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  GraduationCap, 
  Phone, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard,
  Bell,
  MessageCircle,
  Settings
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, clearAuthToken, queryClient } from "@/lib/queryClient";
import { getDashboardPath } from "@/lib/auth-routing";
import type { User } from "@shared/schema";

const WHATSAPP_NUMBER = "+224629516388";
const PHONE_NUMBER = "+224629516388";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
    retry: false,
  });
  const { data: unreadNotifications } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!userData?.user,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSettled: () => {
      clearAuthToken();
      queryClient.setQueryData(["/api/user"], null);
      navigate("/");
    },
  });

  const user = userData?.user;

  const publicNavLinks = [
    { href: "/", label: "Accueil" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/trouver-professeur", label: "Trouver un professeur" },
    { href: "/devenir-professeur", label: "Devenir professeur" },
  ];
  const navLinks = user ? [] : publicNavLinks;

  const getDashboardLink = () => {
    if (!user) return null;
    return getDashboardPath(user.role);
  };
  const dashboardLink = getDashboardLink();
  const logoHref = dashboardLink || "/";

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href={logoHref} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none text-foreground">ProfGui</span>
              {user?.role === "admin" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Administration</span>
              )}
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="text-sm font-medium"
                  data-testid={`nav-${link.href.replace("/", "") || "home"}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-600 dark:text-green-400"
                  aria-label="Contacter ProfGui sur WhatsApp"
                  data-testid="button-whatsapp"
                >
                  <SiWhatsapp className="h-5 w-5" />
                </Button>
              </a>
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1">
                  {dashboardLink && (
                    <Link href={dashboardLink}>
                      <Button
                        variant={isActive(dashboardLink) ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Mon espace
                      </Button>
                    </Link>
                  )}
                  <Link href="/parametres">
                    <Button
                      variant={isActive("/parametres") ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="relative" aria-label="Voir les notifications">
                      <Bell className="h-5 w-5" />
                      {!!unreadNotifications?.count && (
                        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                          {unreadNotifications.count > 9 ? "9+" : unreadNotifications.count}
                        </span>
                      )}
                    </Button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/messages">
                      <Button variant="ghost" size="icon" aria-label="Ouvrir les messages">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>

                <Link href={getDashboardLink() || "/"}>
                  <Avatar className="h-8 w-8 cursor-pointer border hover:border-primary/50 transition-colors">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] bg-primary/10">
                      {user.email?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="hidden md:flex gap-2"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/connexion" className="hidden sm:block">
                  <Button variant="outline" size="sm" data-testid="button-login">
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription" className="hidden sm:block">
                  <Button size="sm" data-testid="button-register">S'inscrire</Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMenuOpen}
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {user && (
                <div className="mb-2 flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  {user.email || user.phone}
                </div>
              )}
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive(link.href) ? "secondary" : "ghost"}
                    className="w-full justify-start text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="my-2 border-t" />
              
              {user ? (
                <>
                  <Link href={getDashboardLink() || "/"}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Tableau de bord
                    </Button>
                  </Link>
                  <Link href="/parametres">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                      {!!unreadNotifications?.count && (
                        <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          {unreadNotifications.count}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={() => {
                      logoutMutation.mutate();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/connexion">
                    <Button variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/inscription">
                    <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
                      S'inscrire
                    </Button>
                  </Link>
                </>
              )}

              <div className="my-2 border-t" />
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 text-green-600">
                    <SiWhatsapp className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
                <a href={`tel:${PHONE_NUMBER}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
