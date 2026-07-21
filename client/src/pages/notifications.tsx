import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDashboardPath } from "@/lib/auth-routing";
import type { Notification as AppNotification, User } from "@shared/schema";

function notificationTypeLabel(type: string) {
  switch (type) {
    case "message":
      return "Message";
    case "course_request":
      return "Réservation";
    case "course_request_status":
      return "Suivi cours";
    case "account_approved":
    case "account_reactivated":
    case "account_suspended":
      return "Compte";
    default:
      return "Info";
  }
}

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const { data: userData, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
  });
  const { data: notifications, isLoading } = useQuery<AppNotification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!userData?.user,
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  useEffect(() => {
    const hasUnreadNotifications = notifications?.some((notification) => !notification.readAt);
    if (!hasUnreadNotifications || markAllMutation.isPending) return;

    const timer = window.setTimeout(() => {
      markAllMutation.mutate();
    }, 800);

    return () => window.clearTimeout(timer);
  }, [notifications, markAllMutation.isPending]);

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData?.user) {
    navigate("/connexion");
    return null;
  }

  return (
    <Layout showFooter={false}>
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Bell className="h-7 w-7 text-primary" />
              Notifications
            </h1>
            <p className="mt-2 text-muted-foreground">
              Les nouvelles notifications sont marquées comme lues automatiquement à l'ouverture.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(getDashboardPath(userData.user.role))}>
            Retour à mon espace
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Chargement...</div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((notification) => {
                const content = (
                  <div className={`rounded-lg border p-4 transition-colors ${notification.readAt ? "bg-background" : "bg-primary/5 border-primary/20"}`}>
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant={notification.readAt ? "outline" : "default"}>{notificationTypeLabel(notification.type)}</Badge>
                        {!notification.readAt && <span className="text-xs font-medium text-primary">Nouveau</span>}
                      </div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                );

                return notification.link ? (
                  <Link key={notification.id} href={notification.link}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
