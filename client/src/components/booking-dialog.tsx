import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Child, Parent, Student, Teacher, User } from "@shared/schema";

interface TeacherWithUser extends Teacher {
  user: Pick<User, "id" | "avatarUrl" | "profileHeadline" | "profileBio" | "isVerified" | "role" | "status">;
}

interface CurrentUserData {
  user: User;
  profile: Student | Parent | Teacher | null;
  children?: Child[] | null;
}

function firstValue(csv: string) {
  return csv.split(",").map((item) => item.trim()).filter(Boolean)[0] || "";
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingDialog({
  teacher,
  triggerClassName,
}: {
  teacher: TeacherWithUser;
  triggerClassName?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(firstValue(teacher.subjects));
  const [level, setLevel] = useState(firstValue(teacher.levels));
  const [courseType, setCourseType] = useState<"domicile" | "en_ligne" | "les_deux">(teacher.courseType || "les_deux");
  const [requestedDate, setRequestedDate] = useState(todayValue());
  const [requestedTime, setRequestedTime] = useState("18:00");
  const [childId, setChildId] = useState("");
  const [message, setMessage] = useState("");

  const { data: currentUser } = useQuery<CurrentUserData>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const subjects = useMemo(() => teacher.subjects.split(",").map((item) => item.trim()).filter(Boolean), [teacher.subjects]);
  const levels = useMemo(() => teacher.levels.split(",").map((item) => item.trim()).filter(Boolean), [teacher.levels]);
  const children = currentUser?.children || [];
  const canBook = currentUser?.user && ["student", "parent"].includes(currentUser.user.role);

  useEffect(() => {
    if (!childId && children[0]) {
      setChildId(children[0].id);
    }
  }, [childId, children]);

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/course-requests", {
        teacherId: teacher.id,
        childId: currentUser?.user.role === "parent" ? childId || undefined : undefined,
        subject,
        level,
        courseType,
        requestedDate,
        requestedTime,
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/course-requests"] });
      setOpen(false);
      setMessage("");
      toast({
        title: "Demande envoyée",
        description: "L'administration ProfGui va étudier votre demande et coordonner la suite.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Réservation impossible",
        description: error.message || "La demande n'a pas pu être envoyée.",
        variant: "destructive",
      });
    },
  });

  if (!currentUser?.user) {
    return (
      <Link href="/connexion">
        <Button className={triggerClassName} size="lg">
          <CalendarCheck className="h-4 w-4" />
          Se connecter pour réserver
        </Button>
      </Link>
    );
  }

  if (!canBook) {
    return (
      <Button className={triggerClassName} size="lg" disabled>
        <CalendarCheck className="h-4 w-4" />
        Réservation élève/parent
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName} size="lg">
          <CalendarCheck className="h-4 w-4" />
          Réserver un cours
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Réserver avec {teacher.firstName} {teacher.lastName}</DialogTitle>
          <DialogDescription>
            Envoyez votre demande à l'administration ProfGui. L'équipe vérifie la disponibilité du professeur avant toute mise en relation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {currentUser.user.role === "parent" && children.length > 0 && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Enfant concerné</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un enfant" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName} {child.lastName} - {child.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Matière</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Niveau</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Type de cours</Label>
            <Select value={courseType} onValueChange={(value) => setCourseType(value as typeof courseType)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domicile">À domicile</SelectItem>
                <SelectItem value="en_ligne">En ligne</SelectItem>
                <SelectItem value="les_deux">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" min={todayValue()} value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Heure</Label>
              <Input type="time" value={requestedTime} onChange={(event) => setRequestedTime(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Message optionnel</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1200}
              placeholder="Expliquez votre besoin, votre disponibilité et l'objectif du cours."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={() => createBookingMutation.mutate()}
            disabled={createBookingMutation.isPending || !subject || !level || !requestedDate || !requestedTime}
          >
            {createBookingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
