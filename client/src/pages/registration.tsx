import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Users, BookOpen, ArrowLeft, ArrowRight, Plus, Trash2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  EDUCATION_LEVELS,
  SUBJECTS,
  CITIES,
  studentRegistrationSchema,
  parentRegistrationSchema,
  teacherRegistrationSchema,
  type StudentRegistration,
  type ParentRegistration,
  type TeacherRegistration,
} from "@shared/schema";

type Role = "student" | "parent" | "teacher" | null;

const roleCards = [
  {
    role: "student" as const,
    icon: GraduationCap,
    title: "Élève",
    description: "Je cherche un professeur pour m'aider dans mes études.",
  },
  {
    role: "parent" as const,
    icon: Users,
    title: "Parent",
    description: "Je cherche un professeur pour mes enfants.",
  },
  {
    role: "teacher" as const,
    icon: BookOpen,
    title: "Professeur",
    description: "Je souhaite donner des cours particuliers.",
  },
];

export default function Registration() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialRole = params.get("role") as Role;
  
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  if (!selectedRole) {
    return (
      <Layout>
        <div className="py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <div className="mb-10 text-center">
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                Créez votre compte
              </h1>
              <p className="text-lg text-muted-foreground">
                Choisissez votre profil pour commencer
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {roleCards.map((card) => (
                <Card
                  key={card.role}
                  className="cursor-pointer transition-all hover-elevate"
                  onClick={() => setSelectedRole(card.role)}
                  data-testid={`card-role-${card.role}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <card.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => setSelectedRole(null)}
            data-testid="button-back-role"
          >
            <ArrowLeft className="h-4 w-4" />
            Changer de profil
          </Button>

          {selectedRole === "student" && <StudentRegistrationForm />}
          {selectedRole === "parent" && <ParentRegistrationForm />}
          {selectedRole === "teacher" && <TeacherRegistrationForm />}
        </div>
      </div>
    </Layout>
  );
}

function StudentRegistrationForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<StudentRegistration>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      city: "",
      level: "",
      subjects: [],
      courseType: "domicile",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: StudentRegistration) =>
      apiRequest("POST", "/api/register/student", data),
    onSuccess: () => {
      toast({
        title: "Inscription réussie !",
        description: "Votre compte élève a été créé avec succès.",
      });
      navigate("/connexion");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentRegistration) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Inscription Élève
        </CardTitle>
        <CardDescription>
          Remplissez le formulaire pour créer votre compte élève
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre prénom" {...field} data-testid="input-firstname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} data-testid="input-lastname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+224 6XX XXX XXX" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="votre@email.com" {...field} data-testid="input-email" />
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
                    <Input type="password" placeholder="••••••" {...field} data-testid="input-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue placeholder="Sélectionnez votre ville" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau / Classe</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-level">
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matières souhaitées</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={field.value?.includes(subject)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, subject]);
                            } else {
                              field.onChange(field.value.filter((s) => s !== subject));
                            }
                          }}
                          data-testid={`checkbox-subject-${subject}`}
                        />
                        <label
                          htmlFor={`subject-${subject}`}
                          className="text-sm leading-none cursor-pointer"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de cours</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-coursetype">
                        <SelectValue placeholder="Sélectionnez le type de cours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="domicile">À domicile</SelectItem>
                      <SelectItem value="en_ligne">En ligne</SelectItem>
                      <SelectItem value="les_deux">Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={mutation.isPending}
              data-testid="button-submit-student"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mutation.isPending ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ParentRegistrationForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<ParentRegistration>({
    resolver: zodResolver(parentRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      address: "",
      children: [{ firstName: "", lastName: "", level: "", subjects: [] }],
    },
  });

  const children = form.watch("children");

  const addChild = () => {
    const currentChildren = form.getValues("children");
    form.setValue("children", [
      ...currentChildren,
      { firstName: "", lastName: "", level: "", subjects: [] },
    ]);
  };

  const removeChild = (index: number) => {
    const currentChildren = form.getValues("children");
    if (currentChildren.length > 1) {
      form.setValue(
        "children",
        currentChildren.filter((_, i) => i !== index)
      );
    }
  };

  const mutation = useMutation({
    mutationFn: (data: ParentRegistration) =>
      apiRequest("POST", "/api/register/parent", data),
    onSuccess: () => {
      toast({
        title: "Inscription réussie !",
        description: "Votre compte parent a été créé avec succès.",
      });
      navigate("/connexion");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ParentRegistration) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Inscription Parent
        </CardTitle>
        <CardDescription>
          Créez votre compte et ajoutez les informations de vos enfants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre prénom" {...field} data-testid="input-parent-firstname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} data-testid="input-parent-lastname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+224 6XX XXX XXX" {...field} data-testid="input-parent-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="votre@email.com" {...field} data-testid="input-parent-email" />
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
                    <Input type="password" placeholder="••••••" {...field} data-testid="input-parent-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre adresse complète" {...field} data-testid="input-parent-address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Enfants</h3>
                <Button type="button" variant="outline" size="sm" onClick={addChild} className="gap-1" data-testid="button-add-child">
                  <Plus className="h-4 w-4" />
                  Ajouter un enfant
                </Button>
              </div>

              {children.map((_, index) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Enfant {index + 1}</span>
                      {children.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChild(index)}
                          className="h-8 w-8 text-destructive"
                          data-testid={`button-remove-child-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`children.${index}.firstName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prénom</FormLabel>
                              <FormControl>
                                <Input placeholder="Prénom de l'enfant" {...field} data-testid={`input-child-firstname-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`children.${index}.lastName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom de l'enfant" {...field} data-testid={`input-child-lastname-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`children.${index}.level`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveau / Classe</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`select-child-level-${index}`}>
                                  <SelectValue placeholder="Sélectionnez le niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EDUCATION_LEVELS.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`children.${index}.subjects`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Matières souhaitées</FormLabel>
                            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                              {SUBJECTS.slice(0, 8).map((subject) => (
                                <div key={subject} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`child-${index}-subject-${subject}`}
                                    checked={field.value?.includes(subject)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, subject]);
                                      } else {
                                        field.onChange(field.value.filter((s) => s !== subject));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`child-${index}-subject-${subject}`}
                                    className="text-sm leading-none cursor-pointer"
                                  >
                                    {subject}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={mutation.isPending}
              data-testid="button-submit-parent"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mutation.isPending ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function TeacherRegistrationForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<TeacherRegistration>({
    resolver: zodResolver(teacherRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      city: "",
      subjects: [],
      levels: [],
      diploma: "",
      experience: "",
      availability: "",
      courseType: "domicile",
      bio: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TeacherRegistration) =>
      apiRequest("POST", "/api/register/teacher", data),
    onSuccess: () => {
      toast({
        title: "Inscription réussie !",
        description: "Votre demande a été soumise. Elle sera examinée par notre équipe.",
      });
      navigate("/connexion");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TeacherRegistration) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Inscription Professeur
        </CardTitle>
        <CardDescription>
          Remplissez le formulaire pour proposer vos services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre prénom" {...field} data-testid="input-teacher-firstname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} data-testid="input-teacher-lastname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+224 6XX XXX XXX" {...field} data-testid="input-teacher-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="votre@email.com" {...field} data-testid="input-teacher-email" />
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
                    <Input type="password" placeholder="••••••" {...field} data-testid="input-teacher-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-teacher-city">
                        <SelectValue placeholder="Sélectionnez votre ville" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matières enseignées</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-4">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`teacher-subject-${subject}`}
                          checked={field.value?.includes(subject)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, subject]);
                            } else {
                              field.onChange(field.value.filter((s) => s !== subject));
                            }
                          }}
                        />
                        <label
                          htmlFor={`teacher-subject-${subject}`}
                          className="text-sm leading-none cursor-pointer"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="levels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveaux enseignés</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-4 max-h-48 overflow-y-auto">
                    {EDUCATION_LEVELS.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`teacher-level-${level}`}
                          checked={field.value?.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, level]);
                            } else {
                              field.onChange(field.value.filter((l) => l !== level));
                            }
                          }}
                        />
                        <label
                          htmlFor={`teacher-level-${level}`}
                          className="text-sm leading-none cursor-pointer"
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diploma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diplôme / Niveau d'étude</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Licence en Mathématiques" {...field} data-testid="input-teacher-diploma" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expérience (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre expérience en enseignement..."
                      {...field}
                      data-testid="textarea-teacher-experience"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilités</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lundi-Vendredi 18h-20h, Weekend" {...field} data-testid="input-teacher-availability" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de cours</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-teacher-coursetype">
                        <SelectValue placeholder="Sélectionnez le type de cours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="domicile">À domicile</SelectItem>
                      <SelectItem value="en_ligne">En ligne</SelectItem>
                      <SelectItem value="les_deux">Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Présentation (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Présentez-vous aux élèves et parents..."
                      {...field}
                      data-testid="textarea-teacher-bio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>
                Votre profil sera examiné par notre équipe avant d'être visible sur la plateforme. 
                Vous recevrez une notification une fois votre compte validé.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={mutation.isPending}
              data-testid="button-submit-teacher"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mutation.isPending ? "Envoi en cours..." : "Soumettre ma candidature"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
