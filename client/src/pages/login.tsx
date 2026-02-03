import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LoginData) => apiRequest("POST", "/api/login", data),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      if (data.user?.mustChangePassword) {
        toast({
          title: "Changement de mot de passe requis",
          description: "Vous devez définir un nouveau mot de passe.",
        });
        navigate("/changer-mot-de-passe");
        return;
      }
      
      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur ProfGui.",
      });
      
      if (data.user?.role === "admin") {
        navigate("/admin");
      } else if (data.user?.role === "teacher") {
        navigate("/dashboard/professeur");
      } else if (data.user?.role === "parent") {
        navigate("/dashboard/parent");
      } else {
        navigate("/dashboard/eleve");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Téléphone ou mot de passe incorrect.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    mutation.mutate(data);
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <LogIn className="h-6 w-6 text-primary" />
                Connexion
              </CardTitle>
              <CardDescription>
                Connectez-vous à votre compte ProfGui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+224 6XX XXX XXX"
                            {...field}
                            data-testid="input-login-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                            data-testid="input-login-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={mutation.isPending}
                    data-testid="button-login-submit"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    {mutation.isPending ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Pas encore de compte ? </span>
                <Link href="/inscription" className="font-medium text-primary hover:underline" data-testid="link-register">
                  S'inscrire
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
