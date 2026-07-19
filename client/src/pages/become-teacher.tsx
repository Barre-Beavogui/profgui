import { useEffect } from "react";
import { Link } from "wouter";
import { SiWhatsapp } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileCheck2,
  HelpCircle,
  MapPin,
  MessageCircle,
  PencilLine,
  Phone,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { ADMIN_WHATSAPP } from "@shared/schema";
import { trackEvent } from "@/lib/analytics";

const teacherRegistrationHref = "/inscription?role=teacher";
const whatsappMessage = "Bonjour ProfGui, j'ai besoin d'aide pour creer mon profil professeur.";
const whatsappHref = `https://wa.me/${ADMIN_WHATSAPP.replace("+", "")}?text=${encodeURIComponent(whatsappMessage)}`;

const benefits = [
  {
    icon: Users,
    title: "Contact avec les familles",
    description: "Présentez votre profil aux élèves et parents qui recherchent un professeur.",
  },
  {
    icon: Clock,
    title: "Organisation flexible",
    description: "Indiquez vos disponibilités et les formats de cours que vous acceptez.",
  },
  {
    icon: BadgeCheck,
    title: "Profil vérifié",
    description: "La vérification aide les familles à identifier les profils fiables.",
  },
  {
    icon: Wallet,
    title: "Tarif indicatif",
    description: "Présentez clairement vos tarifs. Les modalités sont précisées lors de la validation.",
  },
];

const processSteps = [
  {
    icon: PencilLine,
    title: "Créer le profil",
    description: "Renseignez vos informations, matières, niveaux, ville et disponibilités.",
  },
  {
    icon: FileCheck2,
    title: "Compléter les justificatifs",
    description: "Ajoutez les éléments utiles pour vérifier votre identité et votre expertise.",
  },
  {
    icon: SearchCheck,
    title: "Examen par ProfGui",
    description: "L'équipe vérifie la qualité du profil. Le délai dépend de la complétude des informations fournies.",
  },
  {
    icon: MessageCircle,
    title: "Contact des familles",
    description: "Après validation, les élèves et parents peuvent vous contacter directement.",
  },
];

const requirements = [
  "Pièce d'identité",
  "Photo de profil professionnelle",
  "Diplôme, certificat ou justificatif d'expertise",
  "Matières enseignées",
  "Niveaux scolaires pris en charge",
  "Zones de déplacement",
  "Disponibilités",
  "Tarif indicatif",
  "Numéro de téléphone ou WhatsApp",
];

const profileTips = [
  "Utilisez une photo claire et professionnelle.",
  "Rédigez une présentation précise.",
  "Indiquez votre expérience de façon simple.",
  "Sélectionnez correctement les matières et niveaux.",
  "Définissez des disponibilités réalistes.",
  "Répondez rapidement aux familles.",
  "Maintenez vos informations à jour.",
];

const assurances = [
  "Inscription gratuite",
  "Profil examiné par l'équipe ProfGui",
  "Contact direct avec les familles",
  "Contrôle des informations",
  "Profil modifiable",
  "Aucune obligation d'accepter une demande",
];

const faqItems = [
  {
    question: "L'inscription est-elle gratuite ?",
    answer: "Oui, la création du profil professeur est gratuite.",
  },
  {
    question: "Quels documents dois-je fournir ?",
    answer: "Une pièce d'identité, une photo claire et un justificatif d'expertise peuvent être demandés.",
  },
  {
    question: "Dois-je obligatoirement avoir un diplôme ?",
    answer: "Un diplôme est utile, mais une expertise vérifiable peut aussi être étudiée par l'équipe ProfGui.",
  },
  {
    question: "Combien de temps prend la validation du profil ?",
    answer: "Le délai dépend de la complétude des informations fournies.",
  },
  {
    question: "Comment les élèves et les parents me contactent-ils ?",
    answer: "Après validation, les familles peuvent vous contacter avec les moyens indiqués sur votre profil.",
  },
  {
    question: "Est-ce que ProfGui prélève une commission ?",
    answer: "Les modalités vous seront précisées lors de la validation de votre profil.",
  },
  {
    question: "Puis-je donner des cours à domicile et en ligne ?",
    answer: "Oui, vous pouvez indiquer domicile, en ligne ou les deux selon vos possibilités.",
  },
  {
    question: "Puis-je modifier mes tarifs et mes disponibilités ?",
    answer: "Oui, votre profil peut être mis à jour pour garder des informations fiables.",
  },
  {
    question: "Dans quelles villes puis-je proposer mes cours ?",
    answer: "Vous pouvez indiquer votre ville et vos zones de déplacement en Guinée.",
  },
  {
    question: "Comment obtenir le badge de profil vérifié ?",
    answer: "Le badge dépend du contrôle des informations et documents transmis à l'équipe ProfGui.",
  },
];

function TeacherCta({
  label = "Créer mon profil professeur",
  testId,
  className = "",
}: {
  label?: string;
  testId: string;
  className?: string;
}) {
  return (
    <Link href={teacherRegistrationHref}>
      <Button
        size="lg"
        className={`gap-2 ${className}`}
        data-testid={testId}
        onClick={() =>
          trackEvent("teacher_profile_cta_click", {
            label,
            destination: teacherRegistrationHref,
          })
        }
      >
        {label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </Link>
  );
}

function useTeacherSeo() {
  useEffect(() => {
    const title = "Devenir professeur particulier en Guinée | ProfGui";
    const description =
      "Inscrivez-vous gratuitement sur ProfGui, créez votre profil professeur et entrez en contact avec des familles à la recherche de cours particuliers en Guinée.";
    const canonical = `${window.location.origin}/devenir-professeur`;

    const previousTitle = document.title;
    document.title = title;

    const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", canonical);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.dataset.page = "devenir-professeur";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
    document.head.appendChild(structuredData);

    return () => {
      document.title = previousTitle;
      structuredData.remove();
    };
  }, []);
}

export default function BecomeTeacher() {
  useTeacherSeo();

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge variant="outline" className="w-fit border-primary/30 bg-primary/5 text-primary">
                Profil professeur
              </Badge>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Devenez professeur sur <span className="text-primary">ProfGui</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Créez votre profil, présentez vos matières et entrez en contact avec des familles à la recherche de cours particuliers en Guinée.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <TeacherCta label="S'inscrire maintenant" testId="button-register-teacher" className="w-full sm:w-auto" />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("teacher_whatsapp_click", { source: "hero" })}
                >
                  <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                    <SiWhatsapp className="h-5 w-5 text-green-600" aria-hidden="true" />
                    Aide WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            <Card className="relative">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={step.title} className="flex items-start gap-4 rounded-lg border bg-background/80 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <step.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">Étape {index + 1}</span>
                          <h2 className="text-base font-semibold">{step.title}</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Pourquoi enseigner avec ProfGui ?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Des outils simples pour présenter votre profil et recevoir des demandes adaptées.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <TeacherCta testId="button-register-teacher-benefits" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ClipboardCheck className="h-6 w-6 text-primary" aria-hidden="true" />
                Documents nécessaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Ces éléments servent à vérifier la qualité et la fiabilité des profils avant leur mise en ligne.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {requirements.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg bg-background p-3 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                Comment réussir son profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profileTips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ce que nous recherchons</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              ProfGui privilégie les profils clairs, disponibles et capables d'accompagner les élèves avec sérieux.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Une expertise dans votre matière",
              "De la pédagogie et de la patience",
              "Une bonne communication avec les familles",
              "Des informations exactes et à jour",
              "Des disponibilités cohérentes",
              "Une présentation professionnelle",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border p-4">
                <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Questions fréquentes des professeurs</h2>
            <p className="text-muted-foreground">
              Des réponses simples avant de créer votre profil.
            </p>
          </div>
          <Accordion type="single" collapsible className="rounded-lg border bg-background">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger
                  className="px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => trackEvent("teacher_faq_open", { question: item.question })}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 flex justify-center">
            <TeacherCta testId="button-register-teacher-faq" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-6 text-3xl font-bold">Un cadre clair avant la mise en relation</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {assurances.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg bg-background p-3 text-sm">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex h-full flex-col justify-center p-6 md:p-8">
                <h2 className="mb-3 text-2xl font-bold">Ils enseignent avec ProfGui</h2>
                <p className="text-muted-foreground">
                  Les témoignages de professeurs seront affichés ici lorsqu'ils auront été validés par l'équipe ProfGui.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="mb-4 text-3xl font-bold">Besoin d'aide pour créer votre profil ?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Contactez l'équipe ProfGui sur WhatsApp pour être guidé dans la création de votre profil professeur.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <TeacherCta testId="button-register-teacher-final" className="w-full sm:w-auto" />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("teacher_whatsapp_click", { source: "final_cta" })}
            >
              <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                <SiWhatsapp className="h-5 w-5 text-green-600" aria-hidden="true" />
                Contacter ProfGui
              </Button>
            </a>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground sm:flex-row">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>{ADMIN_WHATSAPP}</span>
            <MapPin className="h-4 w-4 sm:ml-4" aria-hidden="true" />
            <span>Guinée</span>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 shadow-lg backdrop-blur md:hidden">
        <TeacherCta testId="button-register-teacher-sticky" className="w-full" />
      </div>
    </Layout>
  );
}
