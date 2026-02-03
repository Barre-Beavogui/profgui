import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GraduationCap,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  LogOut,
  Loader2,
  Eye,
  Copy,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User, Student, Parent, Teacher, Child } from "@shared/schema";

interface AdminStats {
  totalStudents: number;
  totalParents: number;
  totalTeachers: number;
  pendingUsers: number;
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

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({
    open: false,
    type: "",
    id: "",
    name: "",
  });
  const [approvalResult, setApprovalResult] = useState<{ open: boolean; password: string; email: string; phone: string } | null>(null);
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

  const validateUserMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      if (variables.status === "approved" && data.tempPassword) {
        setApprovalResult({
          open: true,
          password: data.tempPassword,
          email: data.userEmail || "",
          phone: data.userPhone || "",
        });
      } else {
        toast({
          title: variables.status === "approved" ? "Utilisateur approuvé" : "Utilisateur rejeté",
          description: variables.status === "approved" 
            ? "L'utilisateur peut maintenant se connecter." 
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

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate("/");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le mot de passe a été copié dans le presse-papier.",
    });
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.user || user.user.role !== "admin") {
    navigate("/connexion");
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold">ProfGui</span>
              <Badge variant="secondary" className="ml-2">Admin</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-8 text-3xl font-bold">Tableau de bord</h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
                                onClick={() => validateUserMutation.mutate({ id: pending.user.id, status: "approved" })}
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
                            <div className="flex justify-end">
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
                            <div className="flex justify-end">
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
        </Tabs>
      </main>

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
              Envoyez ce mot de passe temporaire à l'utilisateur. Il devra le changer à sa première connexion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                    validateUserMutation.mutate({ id: selectedUser.user.id, status: "approved" });
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
    </div>
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
