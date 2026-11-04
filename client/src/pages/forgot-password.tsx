import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Layout } from "@/components/layout";
import { AuthAside } from "@/components/auth-aside";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, readableError } from "@/lib/queryClient";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/request-password-reset", { identifier }),
    onSuccess: () => setSent(true),
    onError: (error) =>
      toast({ title: "Erreur", description: readableError(error), variant: "destructive" }),
  });

  return (
    <Layout showFooter={false}>
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <AuthAside />
        <div className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-sm">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <MailCheck className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">Vérifiez vos emails</h1>
                <p className="mt-3 text-muted-foreground">
                  Si un compte correspond, vous recevrez un lien pour choisir un nouveau mot de passe. Il est
                  valable 24 heures.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Pas d'email sur votre compte ? Contactez-nous sur WhatsApp au +224 629 51 63 88.
                </p>
                <Link href="/connexion">
                  <Button variant="outline" className="mt-8 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tight">Mot de passe oublié</h1>
                <p className="mt-2 text-muted-foreground">
                  Indiquez votre email ou votre téléphone. Nous vous enverrons un lien de réinitialisation.
                </p>
                <form
                  className="mt-8 space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (identifier.trim()) mutation.mutate();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email ou téléphone</Label>
                    <Input
                      id="identifier"
                      className="h-11"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="email@exemple.com ou 6XX XX XX XX"
                      data-testid="input-forgot-identifier"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full gap-2"
                    disabled={mutation.isPending || !identifier.trim()}
                    data-testid="button-forgot-submit"
                  >
                    {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Envoyer le lien
                  </Button>
                </form>
                <Link
                  href="/connexion"
                  className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
