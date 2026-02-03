import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Fatoumata Camara",
    role: "Parent d'élève",
    initials: "FC",
    content:
      "Grâce à ProfGui, mon fils a trouvé un excellent professeur de mathématiques. Ses notes se sont nettement améliorées en quelques mois. Je recommande vivement !",
    rating: 5,
  },
  {
    name: "Ibrahima Sow",
    role: "Élève en Terminale",
    initials: "IS",
    content:
      "Le professeur de physique que j'ai trouvé sur ProfGui m'a vraiment aidé à préparer mon bac. Les cours à domicile sont très pratiques.",
    rating: 5,
  },
  {
    name: "Mariama Diallo",
    role: "Professeur de Français",
    initials: "MD",
    content:
      "ProfGui m'a permis de trouver de nombreux élèves motivés. La plateforme est simple à utiliser et le contact avec les familles est direct.",
    rating: 5,
  },
  {
    name: "Oumar Barry",
    role: "Parent d'élèves",
    initials: "OB",
    content:
      "J'ai inscrit mes trois enfants avec des professeurs différents. L'interface est claire et je peux suivre facilement leurs progrès.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Des centaines de familles nous font confiance pour l'éducation de leurs enfants.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover-elevate">
              <div className="absolute right-4 top-4 text-primary/10">
                <Quote className="h-16 w-16" />
              </div>
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
