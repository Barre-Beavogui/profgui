import { useMutation } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Child, CourseRequest, Parent, Student, Teacher, User } from "@shared/schema";

interface PublicUserSummary {
  id: string;
  email: string | null;
  phone: string;
  role: User["role"];
  status: User["status"];
  avatarUrl: string | null;
  profileHeadline: string | null;
  profileBio: string | null;
  isVerified: boolean | null;
  name: string;
}

interface TeacherWithUser extends Teacher {
  user: PublicUserSummary;
}

export interface CourseRequestDetails extends CourseRequest {
  teacher: TeacherWithUser | null;
  requester: PublicUserSummary | null;
  student: Student | null;
  parent: Parent | null;
  child: Child | null;
}

type ViewerMode = "requester" | "teacher" | "admin";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
  completed: "Terminée",
  cancelled: "Annulée",
};

function statusClass(status: string) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "completed":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "cancelled":
      return "bg-muted text-muted-foreground hover:bg-muted";
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
}

function courseTypeLabel(type?: string | null) {
  if (type === "domicile") return "À domicile";
  if (type === "en_ligne") return "En ligne";
  if (type === "les_deux") return "Les deux";
  return "-";
}

function requestPerson(request: CourseRequestDetails) {
  if (request.child) {
    return `${request.child.firstName} ${request.child.lastName}`;
  }
  if (request.student) {
    return `${request.student.firstName} ${request.student.lastName}`;
  }
  if (request.parent) {
    return `${request.parent.firstName} ${request.parent.lastName}`;
  }
  return request.requester?.name || "Utilisateur";
}

export function CourseRequestsPanel({
  requests,
  isLoading,
  mode,
  emptyText = "Aucune demande de cours pour le moment.",
}: {
  requests?: CourseRequestDetails[];
  isLoading?: boolean;
  mode: ViewerMode;
  emptyText?: string;
}) {
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/course-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/course-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <CalendarClock className="mb-3 h-10 w-10 opacity-30" />
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }

  const renderActions = (request: CourseRequestDetails) => {
    const pending = updateStatusMutation.isPending;

    if (mode === "teacher" && request.status === "pending") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-2" disabled={pending} onClick={() => updateStatusMutation.mutate({ id: request.id, status: "accepted" })}>
            <CheckCircle2 className="h-4 w-4" />
            Accepter
          </Button>
          <Button size="sm" variant="outline" className="gap-2" disabled={pending} onClick={() => updateStatusMutation.mutate({ id: request.id, status: "rejected" })}>
            <XCircle className="h-4 w-4" />
            Refuser
          </Button>
        </div>
      );
    }

    if ((mode === "teacher" || mode === "admin") && request.status === "accepted") {
      return (
        <Button size="sm" variant="outline" className="gap-2" disabled={pending} onClick={() => updateStatusMutation.mutate({ id: request.id, status: "completed" })}>
          <CheckCircle2 className="h-4 w-4" />
          Marquer terminé
        </Button>
      );
    }

    if ((mode === "requester" || mode === "admin") && ["pending", "accepted"].includes(request.status)) {
      return (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => updateStatusMutation.mutate({ id: request.id, status: "cancelled" })}>
          Annuler
        </Button>
      );
    }

    if (updateStatusMutation.isPending) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id} className="border-muted">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">{request.subject}</h4>
                  <Badge className={statusClass(request.status)}>{statusLabels[request.status] || request.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mode === "teacher" || mode === "admin"
                    ? `Pour ${requestPerson(request)}`
                    : `Avec ${request.teacher ? `${request.teacher.firstName} ${request.teacher.lastName}` : "professeur"}`}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-1">{request.level || "Niveau non précisé"}</span>
                  <span className="rounded bg-muted px-2 py-1">{courseTypeLabel(request.courseType)}</span>
                  <span className="rounded bg-muted px-2 py-1">
                    {request.requestedDate || "Date à confirmer"} {request.requestedTime || ""}
                  </span>
                </div>
                {request.message && <p className="line-clamp-2 text-sm text-muted-foreground">{request.message}</p>}
              </div>
              <div className="shrink-0">{renderActions(request)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
