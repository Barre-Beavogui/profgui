import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(6, "Confirmez le mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

const requestSchema = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis"),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      apiRequest("POST", "/api/reset-password", payload),
    onSuccess: async () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Vous შეგიძლიათ maintenant vous connecter.",
      });
      navigate("/connexion");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Lien invalide ou expiré.",
        variant: "destructive",
      });
    },
  });

  const requestMutation = useMutation({
    mutationFn: (payload: RequestForm) =>
      apiRequest("POST", "/api/request-password-reset", payload),
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Si le compte existe, un email de réinitialisation a été envoyé.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetForm) => {
    if (!token) {
      toast({
        title: "Lien invalide",
        description: "Le lien de réinitialisation est manquant.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ token, newPassword: data.newPassword });
  };

  const onRequestSubmit = (data: RequestForm) => {
    requestMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <KeyRound className="h-6 w-6 text-primary" />
                Réinitialiser le mot de passe
              </CardTitle>
              <CardDescription>
                Définissez un nouveau mot de passe pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {token ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full gap-2" disabled={mutation.isPending}>
                      {mutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      {mutation.isPending ? "Envoi..." : "Valider"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...requestForm}>
                  <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6">
                    <FormField
                      control={requestForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email ou téléphone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email@exemple.com ou +224 6XX XXX XXX"
                              {...field}
                              data-testid="input-reset-identifier"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full gap-2" disabled={requestMutation.isPending}>
                      {requestMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      {requestMutation.isPending ? "Envoi..." : "Recevoir le lien"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
