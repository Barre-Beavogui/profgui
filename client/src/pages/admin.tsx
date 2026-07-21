import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseRequestsPanel, type CourseRequestDetails } from "@/components/course-requests-panel";
import {
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Eye,
  Copy,
  Ban,
  Unlock,
  Mail,
  CalendarCheck,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDashboardPath } from "@/lib/auth-routing";
import { useToast } from "@/hooks/use-toast";
import type { User, Student, Parent, Teacher, Child } from "@shared/schema";

interface AdminStats {
  totalStudents: number;
  totalParents: number;
  totalTeachers: number;
  pendingUsers: number;
  suspendedUsers: number;
}

interface PendingUser {
  user: User;
  profile: Student | Parent | Teacher | null;
  children?: Child[];
}

interface StudentWithUser extends Student {
  user: User;
}

interface ParentWithUser extends Parent {
  user: User;
  children: Child[];
}

interface TeacherWithUser extends Teacher {
  user: User;
}

const APPROVAL_TEMPLATE_SUBJECT_KEY = "profgui-approval-email-subject";
const APPROVAL_TEMPLATE_MESSAGE_KEY = "profgui-approval-email-message";

const DEFAULT_APPROVAL_SUBJECT = "Votre compte ProfGui est approuvé";
const DEFAULT_APPROVAL_MESSAGE = `Bonjour {{prenom}} {{nom}},

Votre compte ProfGui a été approuvé par l'administrateur.

Voici vos identifiants de connexion :
Identifiant : {{identifiant}}
Mot de passe temporaire : {{motDePasse}}

Pour votre sécurité, pensez à modifier ce mot de passe dès votre première connexion. L'application vous demandera automatiquement de définir un nouveau mot de passe.

Connectez-vous ici : {{lienConnexion}}

Bienvenue sur ProfGui.
L'équipe ProfGui`;

function getStoredApprovalTemplate(key: string, fallback: string) {
  const stored = localStorage.getItem(key)?.trim();
  return stored || fallback;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({
    open: false,
    type: "",
    id: "",
    name: "",
  });
  const [approvalResult, setApprovalResult] = useState<{
    open: boolean;
    password: string;
    email: string;
    phone: string;
    emailSent?: boolean;
    emailError?: string;
  } | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    pending: PendingUser;
    subject: string;
    message: string;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: pendingUsers, isLoading: pendingLoading } = useQuery<PendingUser[]>({
    queryKey: ["/api/admin/pending-users"],
  });

  const { data: students, isLoading: studentsLoading } = useQuery<StudentWithUser[]>({
    queryKey: ["/api/admin/students"],
  });

  const { data: parents, isLoading: parentsLoading } = useQuery<ParentWithUser[]>({
    queryKey: ["/api/admin/parents"],
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery<TeacherWithUser[]>({
    queryKey: ["/api/admin/teachers"],
  });
  const { data: courseRequests, isLoading: requestsLoading } = useQuery<CourseRequestDetails[]>({
    queryKey: ["/api/admin/course-requests"],
  });

  const validateUserMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      emailSubject,
      emailMessage,
    }: {
      id: string;
      status: User["status"];
      emailSubject?: string;
      emailMessage?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/status`, {
        status,
        emailSubject,
        emailMessage,
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      if (variables.status === "approved" && data.tempPassword) {
        setApprovalDialog(null);
        setApprovalResult({
          open: true,
          password: data.tempPassword,
          email: data.userEmail || "",
          phone: data.userPhone || "",
          emailSent: data.emailSent,
          emailError: data.emailError,
        });
      } else {
        toast({
          title: data.message || "Statut modifié",
          description:
            variables.status === "suspended"
              ? "Le compte ne peut plus accéder à l'application."
              : variables.status === "approved"
                ? "Le compte peut de nouveau accéder à l'application."
                : "L'utilisateur a été rejeté.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) =>
      apiRequest("DELETE", `/api/admin/${type}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      setDeleteDialog({ open: false, type: "", id: "", name: "" });
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le mot de passe a été copié dans le presse-papier.",
    });
  };

  const openApprovalDialog = (pending: PendingUser) => {
    setApprovalDialog({
      open: true,
      pending,
      subject: getStoredApprovalTemplate(APPROVAL_TEMPLATE_SUBJECT_KEY, DEFAULT_APPROVAL_SUBJECT),
      message: getStoredApprovalTemplate(APPROVAL_TEMPLATE_MESSAGE_KEY, DEFAULT_APPROVAL_MESSAGE),
    });
  };

  const generateDefaultApprovalEmail = () => {
    if (!approvalDialog) return;
    setApprovalDialog({
      ...approvalDialog,
      subject: DEFAULT_APPROVAL_SUBJECT,
      message: DEFAULT_APPROVAL_MESSAGE,
    });
  };

  const approveWithEmail = () => {
    if (!approvalDialog) return;
    localStorage.setItem(APPROVAL_TEMPLATE_SUBJECT_KEY, approvalDialog.subject);
    localStorage.setItem(APPROVAL_TEMPLATE_MESSAGE_KEY, approvalDialog.message);
    validateUserMutation.mutate({
      id: approvalDialog.pending.user.id,
      status: "approved",
      emailSubject: approvalDialog.subject,
      emailMessage: approvalDialog.message,
    });
  };

  const updateAccess = (accountUser: User | undefined, status: User["status"]) => {
    if (!accountUser) return;
    validateUserMutation.mutate({ id: accountUser.id, status });
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.user) {
    navigate("/connexion");
    return null;
  }

  if (user.user.role !== "admin") {
    navigate(getDashboardPath(user.user.role));
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "student": return "Élève";
      case "parent": return "Parent";
      case "teacher": return "Professeur";
      default: return role;
    }
  };

  const getProfileName = (pending: PendingUser) => {
    if (pending.profile && "firstName" in pending.profile) {
      return `${pending.profile.firstName} ${pending.profile.lastName}`;
    }
    return pending.user.phone;
  };

  const renderAccessButton = (accountUser: User | undefined) => {
    if (!accountUser || accountUser.role === "admin" || accountUser.status === "pending") {
      return null;
    }

    if (accountUser.status === "approved") {
      return (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-amber-700 hover:text-amber-800"
          onClick={() => updateAccess(accountUser, "suspended")}
          disabled={validateUserMutation.isPending}
          data-testid={`button-suspend-${accountUser.id}`}
        >
          <Ban className="h-4 w-4" />
          Suspendre
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-2 text-green-700 hover:text-green-800"
        onClick={() => updateAccess(accountUser, "approved")}
        disabled={validateUserMutation.isPending}
        data-testid={`button-reactivate-${accountUser.id}`}
      >
        <Unlock className="h-4 w-4" />
        Donner accès
      </Button>
    );
  };

  return (
    <Layout showFooter={false}>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-8 text-3xl font-bold">Tableau de bord Administration</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Élèves"
            value={stats?.totalStudents ?? 0}
            icon={GraduationCap}
            loading={statsLoading}
          />
          <StatCard
            title="Parents"
            value={stats?.totalParents ?? 0}
            icon={Users}
            loading={statsLoading}
          />
          <StatCard
            title="Professeurs"
            value={stats?.totalTeachers ?? 0}
            icon={BookOpen}
            loading={statsLoading}
          />
          <StatCard
            title="En attente"
            value={stats?.pendingUsers ?? 0}
            icon={Clock}
            loading={statsLoading}
            highlight={!!stats?.pendingUsers}
          />
          <StatCard
            title="Suspendus"
            value={stats?.suspendedUsers ?? 0}
            icon={Ban}
            loading={statsLoading}
            highlight={!!stats?.suspendedUsers}
          />
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
              En attente
              {pendingUsers && pendingUsers.length > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 justify-center">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="teachers" data-testid="tab-teachers">Professeurs</TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">Élèves</TabsTrigger>
            <TabsTrigger value="parents" data-testid="tab-parents">Parents</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-course-requests">Réservations</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inscriptions en attente de validation</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <TableSkeleton />
                ) : !pendingUsers || pendingUsers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Aucune demande en attente
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((pending) => (
                        <TableRow key={pending.user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getProfileName(pending).substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {getProfileName(pending)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getRoleLabel(pending.user.role)}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{pending.user.phone}</TableCell>
                          <TableCell className="hidden md:table-cell">{pending.user.email || "-"}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedUser(pending)}
                                data-testid={`button-view-${pending.user.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openApprovalDialog(pending)}
                                disabled={validateUserMutation.isPending}
                                data-testid={`button-approve-${pending.user.id}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => validateUserMutation.mutate({ id: pending.user.id, status: "rejected" })}
                                disabled={validateUserMutation.isPending}
                                data-testid={`button-reject-${pending.user.id}`}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>Tous les professeurs</CardTitle>
              </CardHeader>
              <CardContent>
                {teachersLoading ? (
                  <TableSkeleton />
                ) : !teachers || teachers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Aucun professeur inscrit
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden md:table-cell">Ville</TableHead>
                        <TableHead className="hidden md:table-cell">Matières</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {teacher.firstName.charAt(0)}
                                  {teacher.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {teacher.firstName} {teacher.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{teacher.city}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {teacher.subjects.split(",").slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">
                                  {s.trim()}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={teacher.user?.status || "pending"} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {renderAccessButton(teacher.user)}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "teachers",
                                    id: teacher.id,
                                    name: `${teacher.firstName} ${teacher.lastName}`,
                                  })
                                }
                                data-testid={`button-delete-teacher-${teacher.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Tous les élèves</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <TableSkeleton />
                ) : !students || students.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Aucun élève inscrit
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden md:table-cell">Ville</TableHead>
                        <TableHead className="hidden md:table-cell">Niveau</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {student.firstName.charAt(0)}
                                  {student.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{student.city}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.level}</TableCell>
                          <TableCell>
                            <StatusBadge status={student.user?.status || "pending"} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {renderAccessButton(student.user)}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "students",
                                    id: student.id,
                                    name: `${student.firstName} ${student.lastName}`,
                                  })
                                }
                                data-testid={`button-delete-student-${student.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents">
            <Card>
              <CardHeader>
                <CardTitle>Tous les parents</CardTitle>
              </CardHeader>
              <CardContent>
                {parentsLoading ? (
                  <TableSkeleton />
                ) : !parents || parents.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Aucun parent inscrit
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="hidden md:table-cell">Adresse</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parents.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {parent.firstName.charAt(0)}
                                  {parent.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {parent.firstName} {parent.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{parent.address}</TableCell>
                          <TableCell>
                            <StatusBadge status={parent.user?.status || "pending"} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {renderAccessButton(parent.user)}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "parents",
                                    id: parent.id,
                                    name: `${parent.firstName} ${parent.lastName}`,
                                  })
                                }
                                data-testid={`button-delete-parent-${parent.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Toutes les réservations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseRequestsPanel
                  requests={courseRequests}
                  isLoading={requestsLoading}
                  mode="admin"
                  emptyText="Aucune réservation enregistrée."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!approvalDialog?.open} onOpenChange={() => setApprovalDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Approuver et envoyer les identifiants
            </DialogTitle>
            <DialogDescription>
              Le mot de passe temporaire sera généré automatiquement. Vous pouvez adapter le message avant l'envoi.
            </DialogDescription>
          </DialogHeader>
          {approvalDialog && (
            <div className="space-y-4">
              <div className="rounded border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{getProfileName(approvalDialog.pending)}</p>
                <p className="text-muted-foreground">
                  {approvalDialog.pending.user.email || approvalDialog.pending.user.phone}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="approval-email-subject">
                  Sujet
                </label>
                <Input
                  id="approval-email-subject"
                  value={approvalDialog.subject}
                  onChange={(event) =>
                    setApprovalDialog({ ...approvalDialog, subject: event.target.value })
                  }
                  data-testid="input-approval-email-subject"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium" htmlFor="approval-email-message">
                    Message
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDefaultApprovalEmail}
                    data-testid="button-generate-approval-email"
                  >
                    Générer automatiquement
                  </Button>
                </div>
                <Textarea
                  id="approval-email-message"
                  className="min-h-[260px] font-mono text-sm"
                  value={approvalDialog.message}
                  onChange={(event) =>
                    setApprovalDialog({ ...approvalDialog, message: event.target.value })
                  }
                  data-testid="textarea-approval-email-message"
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles : {"{{prenom}}"}, {"{{nom}}"}, {"{{identifiant}}"}, {"{{motDePasse}}"}, {"{{lienConnexion}}"}.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialog(null)}>
              Annuler
            </Button>
            <Button onClick={approveWithEmail} disabled={validateUserMutation.isPending}>
              {validateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Approuver et envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte de {deleteDialog.name} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ type: deleteDialog.type, id: deleteDialog.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!approvalResult?.open} onOpenChange={() => setApprovalResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utilisateur approuvé</DialogTitle>
            <DialogDescription>
              {approvalResult?.emailSent
                ? "L'email d'approbation a été envoyé avec les identifiants."
                : "Le compte est approuvé. Envoyez les identifiants manuellement si l'email n'a pas été envoyé."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {approvalResult?.emailError && (
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                {approvalResult.emailError}
              </div>
            )}
            {approvalResult?.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{approvalResult.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Téléphone:</p>
              <p className="font-medium">{approvalResult?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mot de passe temporaire:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted p-2 font-mono text-lg">
                  {approvalResult?.password}
                </code>
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(approvalResult?.password || "")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setApprovalResult(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'inscription</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{getRoleLabel(selectedUser.user.role)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone:</span>
                  <span>{selectedUser.user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{selectedUser.user.email || "-"}</span>
                </div>
              </div>

              {selectedUser.profile && "firstName" in selectedUser.profile && (
                <div className="border-t pt-4">
                  <h4 className="mb-2 font-medium">Profil</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom:</span>
                      <span>{selectedUser.profile.firstName} {selectedUser.profile.lastName}</span>
                    </div>
                    {"city" in selectedUser.profile && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ville:</span>
                        <span>{selectedUser.profile.city}</span>
                      </div>
                    )}
                    {"level" in selectedUser.profile && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Niveau:</span>
                        <span>{selectedUser.profile.level}</span>
                      </div>
                    )}
                    {"subjects" in selectedUser.profile && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Matières:</span>
                        <div className="flex flex-wrap justify-end gap-1">
                          {selectedUser.profile.subjects.split(",").map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {"diploma" in selectedUser.profile && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Diplôme:</span>
                        <span>{selectedUser.profile.diploma}</span>
                      </div>
                    )}
                    {"levels" in selectedUser.profile && (
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Niveaux enseignés:</span>
                        <div className="flex flex-wrap justify-end gap-1">
                          {selectedUser.profile.levels.split(",").map((l) => (
                            <Badge key={l} variant="outline" className="text-xs">{l.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {"address" in selectedUser.profile && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Adresse:</span>
                        <span>{selectedUser.profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedUser.children && selectedUser.children.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="mb-2 font-medium">Enfants ({selectedUser.children.length})</h4>
                  <div className="space-y-2">
                    {selectedUser.children.map((child, i) => (
                      <div key={child.id} className="rounded border p-2 text-sm">
                        <p className="font-medium">{child.firstName} {child.lastName}</p>
                        <p className="text-muted-foreground">Niveau: {child.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Fermer
            </Button>
            {selectedUser && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    validateUserMutation.mutate({ id: selectedUser.user.id, status: "rejected" });
                    setSelectedUser(null);
                  }}
                >
                  Rejeter
                </Button>
                <Button
                  onClick={() => {
                    openApprovalDialog(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  Approuver
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  highlight,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary" : ""}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approuvé</Badge>;
    case "suspended":
      return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">Suspendu</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejeté</Badge>;
    default:
      return <Badge variant="secondary">En attente</Badge>;
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
