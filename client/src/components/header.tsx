import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, GraduationCap, Phone, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      navigate("/");
    },
  });

  const user = userData?.user;

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/trouver-professeur", label: "Trouver un professeur" },
    { href: "/devenir-professeur", label: "Devenir professeur" },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case "admin": return "/admin";
      case "student": return "/dashboard/eleve";
      case "parent": return "/dashboard/parent";
      case "teacher": return "/dashboard/professeur";
      default: return "/";
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
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

          <nav className="hidden items-center gap-1 md:flex">
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
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 dark:text-green-400"
                data-testid="button-whatsapp"
              >
                <SiWhatsapp className="h-5 w-5" />
              </Button>
            </a>
            <a href={`tel:${PHONE_NUMBER}`} className="hidden lg:block">
              <Button variant="ghost" size="icon" data-testid="button-phone">
                <Phone className="h-5 w-5" />
              </Button>
            </a>
            <ThemeToggle />
            
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href={getDashboardLink() || "/"}>
                  <Button variant="ghost" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Quitter
                </Button>
              </div>
            ) : (
              <>
                <Link href="/connexion" className="hidden sm:block">
                  <Button variant="outline" data-testid="button-login">
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription" className="hidden sm:block">
                  <Button data-testid="button-register">S'inscrire</Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
