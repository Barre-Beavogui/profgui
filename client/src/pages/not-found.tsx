import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 text-9xl font-bold text-primary/20">404</div>
        <h1 className="mb-4 text-3xl font-bold">Page non trouvée</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2" data-testid="button-go-back">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    </Layout>
  );
}
