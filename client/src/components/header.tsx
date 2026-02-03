import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, GraduationCap, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const WHATSAPP_NUMBER = "+224620000000";
const PHONE_NUMBER = "+224620000000";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/trouver-professeur", label: "Trouver un professeur" },
    { href: "/devenir-professeur", label: "Devenir professeur" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ProfGui</span>
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
              className="hidden sm:block"
            >
              <Button variant="ghost" size="icon" className="text-green-600 dark:text-green-400" data-testid="button-whatsapp">
                <SiWhatsapp className="h-5 w-5" />
              </Button>
            </a>
            <a href={`tel:${PHONE_NUMBER}`} className="hidden sm:block">
              <Button variant="ghost" size="icon" data-testid="button-phone">
                <Phone className="h-5 w-5" />
              </Button>
            </a>
            <ThemeToggle />
            <Link href="/connexion" className="hidden sm:block">
              <Button variant="outline" data-testid="button-login">
                Connexion
              </Button>
            </Link>
            <Link href="/inscription" className="hidden sm:block">
              <Button data-testid="button-register">S'inscrire</Button>
            </Link>
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
              <div className="my-2 border-t" />
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
