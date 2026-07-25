import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Filter,
  GraduationCap,
  Headphones,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Truck,
  X,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PREFECTURES } from "@/lib/geography";
import { MARKETPLACE_ITEMS, MarketplaceCategory, MarketplaceItem } from "@/lib/marketplace-data";

const CONTACT_WHATSAPP = "+224629516388";
const CONTACT_PHONE = "+224629516388";
const CONTACT_EMAIL = "contact@profgui.com";

const categoryMeta: Record<
  MarketplaceCategory,
  {
    title: string;
    shortLabel: string;
    description: string;
    icon: typeof GraduationCap;
    color: string;
  }
> = {
  formation: {
    title: "Formations",
    shortLabel: "Formation",
    description: "Ateliers, cours intensifs et parcours en ligne.",
    icon: GraduationCap,
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  document: {
    title: "Documents & livres",
    shortLabel: "Document",
    description: "Guides, annales, livres et supports de révision.",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  materiel: {
    title: "Matériel éducatif",
    shortLabel: "Matériel",
    description: "Kits, fournitures et outils pédagogiques.",
    icon: ShoppingBag,
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
};

const categories = Object.entries(categoryMeta).map(([id, meta]) => ({
  id: id as MarketplaceCategory,
  ...meta,
}));

function formatPrice(item: MarketplaceItem) {
  return `${new Intl.NumberFormat("fr-FR").format(item.price)} ${item.currency}`;
}

function getWhatsAppOrderUrl(item: MarketplaceItem) {
  const text = encodeURIComponent(
    `Bonjour ProfGui, je suis intéressé par "${item.title}" dans les ressources ProfGui. Pouvez-vous me donner les détails ?`,
  );
  return `https://wa.me/${CONTACT_WHATSAPP.replace("+", "")}?text=${text}`;
}

function getGallery(item: MarketplaceItem) {
  return item.gallery && item.gallery.length > 0 ? item.gallery : [item.image];
}

function getHeroCopy(item: MarketplaceItem, index: number) {
  const category = categoryMeta[item.category];
  const firstHighlight = item.highlights?.[0] || category.description;

  const titles: Record<MarketplaceCategory, string> = {
    document: "Des supports clairs pour réviser plus vite",
    formation: "Des formations utiles pour progresser concrètement",
    materiel: "Du matériel pédagogique présenté comme en boutique",
  };

  const descriptions: Record<MarketplaceCategory, string> = {
    document: `Mettez en avant les meilleurs livres, guides et annales avec une présentation lisible, un prix clair et une commande centralisée par ProfGui.`,
    formation: `Présentez les ateliers, cours intensifs et parcours en ligne avec des visuels professionnels et des informations faciles à comparer.`,
    materiel: `Exposez les kits, fournitures et outils éducatifs avec de grandes photos, des points forts et un contact direct avec l'équipe ProfGui.`,
  };

  return {
    item,
    image: getGallery(item)[index % getGallery(item).length],
    kicker: `${category.shortLabel} à la une`,
    title: titles[item.category],
    description: descriptions[item.category],
    highlight: firstHighlight,
  };
}

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | "all">("all");
  const [prefecture, setPrefecture] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeHeroImageIndex, setActiveHeroImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImage(selectedItem?.image || "");
  }, [selectedItem]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return MARKETPLACE_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesPrefecture = prefecture === "all" || item.location.prefecture === prefecture;
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.highlights?.some((highlight) => highlight.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesPrefecture && matchesSearch;
    });
  }, [selectedCategory, prefecture, searchQuery]);

  const featuredItems = useMemo(() => MARKETPLACE_ITEMS.filter((item) => item.isFeatured), []);
  const heroSlides = useMemo(
    () => featuredItems.map((item, index) => getHeroCopy(item, index)),
    [featuredItems],
  );
  const activeHero = heroSlides[activeHeroIndex % Math.max(heroSlides.length, 1)] || getHeroCopy(MARKETPLACE_ITEMS[0], 0);
  const activeHeroGallery = getGallery(activeHero.item);
  const activeHeroImage = activeHeroGallery[activeHeroImageIndex % activeHeroGallery.length] || activeHero.image;
  const hasActiveFilters = searchQuery || selectedCategory !== "all" || prefecture !== "all";

  useEffect(() => {
    if (heroSlides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length);
      setActiveHeroImageIndex(0);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    setActiveHeroImageIndex(0);
  }, [activeHeroIndex]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPrefecture("all");
  };

  return (
    <Layout>
      <div className="bg-background">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <img
            key={activeHeroImage}
            src={activeHeroImage}
            alt=""
            className="resource-hero-image absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-emerald-950/88 to-slate-950/52" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge className="mb-5 rounded-md bg-amber-400 px-3 py-1 text-slate-950 hover:bg-amber-400">
                {activeHero.kicker}
              </Badge>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.04] md:text-6xl">
                {activeHero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                {activeHero.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={getWhatsAppOrderUrl(activeHero.item)} target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 w-full gap-2 rounded-md bg-amber-400 font-black text-slate-950 hover:bg-amber-300 sm:w-auto">
                    <SiWhatsapp className="h-5 w-5" />
                    Demander ce produit
                  </Button>
                </a>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedItem(activeHero.item)}
                  className="h-12 w-full gap-2 rounded-md border-white/30 bg-white/8 font-black text-white hover:bg-white/14 sm:w-auto"
                >
                  Voir la fiche
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-200" />
                  <p className="font-black">Texte dynamique</p>
                  <p className="mt-1 text-sm text-white/66">Le message change selon la ressource.</p>
                </div>
                <div className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
                  <PackageCheck className="mb-3 h-5 w-5 text-amber-300" />
                  <p className="font-black">Image dynamique</p>
                  <p className="mt-1 text-sm text-white/66">Photo de fond et produit synchronisés.</p>
                </div>
                <div className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
                  <Headphones className="mb-3 h-5 w-5 text-sky-200" />
                  <p className="font-black">Commande assistée</p>
                  <p className="mt-1 text-sm text-white/66">Contact WhatsApp ou appel.</p>
                </div>
              </div>
            </div>

            <div className="marketplace-perspective">
              <div className="marketplace-card-3d overflow-hidden rounded-lg border border-white/18 bg-white text-slate-950 shadow-2xl">
                <div className="grid md:grid-cols-[0.94fr_1.06fr]">
                  <div className="relative min-h-[320px] overflow-hidden md:min-h-[440px]">
                    <img
                      src={activeHeroImage}
                      alt={activeHero.item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Badge className={`${categoryMeta[activeHero.item.category].color} rounded-md border`}>
                        {categoryMeta[activeHero.item.category].shortLabel}
                      </Badge>
                      {activeHero.item.isNew && <Badge className="rounded-md bg-emerald-700 text-white">Nouveau</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-col p-5 md:p-6">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">À la une maintenant</p>
                    <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
                      {activeHero.item.title}
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {activeHero.highlight}
                    </p>
                    <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Prix affiché</p>
                      <p className="mt-1 text-3xl font-black text-emerald-700">{formatPrice(activeHero.item)}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {activeHeroGallery.slice(0, 3).map((image, index) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setActiveHeroImageIndex(index)}
                          className={`overflow-hidden rounded-md border bg-muted ${
                            index === activeHeroImageIndex ? "border-emerald-700 ring-2 ring-emerald-700/20" : "border-transparent"
                          }`}
                          aria-label={`Voir image ${index + 1}`}
                        >
                          <img src={image} alt="" className="h-20 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      {activeHero.item.location.prefecture}
                      {activeHero.item.location.subPrefecture ? `, ${activeHero.item.location.subPrefecture}` : ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.item.id}
                    type="button"
                    onClick={() => setActiveHeroIndex(index)}
                    className={`rounded-lg border p-3 text-left transition ${
                      index === activeHeroIndex % Math.max(heroSlides.length, 1)
                        ? "border-amber-300 bg-amber-400 text-slate-950"
                        : "border-white/16 bg-white/10 text-white hover:bg-white/16"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-wide">{slide.kicker}</span>
                    <span className="mt-1 block line-clamp-2 text-sm font-bold">{slide.item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-amber-50">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
            <div className="grid gap-3 md:grid-cols-[1fr_260px_260px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher un livre, un cours, un kit scientifique..."
                  className="h-12 rounded-md border-amber-200 bg-white pl-12 shadow-sm"
                  data-testid="input-marketplace-search"
                />
              </div>
              <Select value={prefecture} onValueChange={setPrefecture}>
                <SelectTrigger className="h-12 rounded-md border-amber-200 bg-white shadow-sm">
                  <MapPin className="mr-2 h-4 w-4 text-emerald-700" />
                  <SelectValue placeholder="Toute la Guinée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute la Guinée</SelectItem>
                  {PREFECTURES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as MarketplaceCategory | "all")}
              >
                <SelectTrigger className="h-12 rounded-md border-amber-200 bg-white shadow-sm">
                  <Filter className="mr-2 h-4 w-4 text-emerald-700" />
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Catégories</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-left text-sm font-bold transition ${
                      selectedCategory === "all" ? "bg-emerald-700 text-white" : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    Toutes les ressources
                    <span>{MARKETPLACE_ITEMS.length}</span>
                  </button>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const count = MARKETPLACE_ITEMS.filter((item) => item.category === category.id).length;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full rounded-md border px-4 py-4 text-left transition ${
                          selectedCategory === category.id
                            ? "border-emerald-700 bg-emerald-50"
                            : "border-border bg-background hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-md border ${category.color}`}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="font-black">{category.title}</span>
                          </div>
                          <span className="text-sm font-black text-muted-foreground">{count}</span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">{category.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border bg-slate-950 p-5 text-white">
                <Store className="mb-4 h-7 w-7 text-amber-300" />
                <h3 className="text-lg font-black">Publier une ressource</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Professeur ou centre de formation: proposez vos supports à
                  l'équipe ProfGui.
                </p>
                <Link href="/devenir-professeur">
                  <Button className="mt-5 h-11 w-full rounded-md bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
                    Proposer un produit
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-14">
            {!hasActiveFilters && featuredItems.length > 0 && (
              <section>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <Badge variant="outline" className="mb-3 rounded-md border-amber-300 bg-amber-50 text-amber-900">
                      Sélection ProfGui
                    </Badge>
                    <h2 className="text-3xl font-black tracking-tight md:text-4xl">Produits à mettre en avant</h2>
                    <p className="mt-3 max-w-2xl text-muted-foreground">
                      Des ressources bien présentées, avec de vraies photos au
                      premier plan.
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-md" onClick={() => setSelectedCategory("all")}>
                    Voir tout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {featuredItems.slice(0, 3).map((item) => (
                    <ItemCard key={item.id} item={item} onSelect={setSelectedItem} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">
                    {hasActiveFilters ? "Résultats de recherche" : "Catalogue des ressources"}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {filteredItems.length} ressource{filteredItems.length > 1 ? "s" : ""} disponible{filteredItems.length > 1 ? "s" : ""}.
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" className="w-fit gap-2 rounded-md" onClick={resetFilters}>
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed bg-muted/30 px-6 py-20 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-black">Aucun produit trouvé</h3>
                  <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                    Essayez une autre matière, une autre ville ou une catégorie
                    plus large.
                  </p>
                  <Button className="mt-6 rounded-md" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="bg-slate-950 py-14 text-white md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <Badge className="mb-4 rounded-md bg-white/12 text-white hover:bg-white/12">
                Commande accompagnée
              </Badge>
              <h2 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
                Vous cherchez une ressource précise pour vos cours ?
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
                Envoyez votre demande à ProfGui. L'équipe peut orienter vers un
                produit, une formation ou un professeur selon le besoin.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href={`https://wa.me/${CONTACT_WHATSAPP.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                <Button className="h-12 w-full justify-start gap-3 rounded-md bg-green-600 font-black text-white hover:bg-green-700">
                  <SiWhatsapp className="h-5 w-5" />
                  WhatsApp ProfGui
                </Button>
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Button variant="outline" className="h-12 w-full justify-start gap-3 rounded-md border-white/24 bg-transparent font-black text-white hover:bg-white/10">
                  <Mail className="h-5 w-5" />
                  {CONTACT_EMAIL}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto rounded-lg p-0">
          {selectedItem && (
            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              <div className="bg-slate-100 p-4 md:p-6">
                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                  <img
                    src={selectedImage || selectedItem.image}
                    alt={selectedItem.title}
                    className="h-[360px] w-full object-cover md:h-[520px]"
                  />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {(selectedItem.gallery || [selectedItem.image]).slice(0, 4).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-md border bg-white ${
                        selectedImage === image ? "border-emerald-700 ring-2 ring-emerald-700/20" : "border-white"
                      }`}
                    >
                      <img src={image} alt="" className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <DialogHeader>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge className={`${categoryMeta[selectedItem.category].color} rounded-md border`}>
                      {categoryMeta[selectedItem.category].title}
                    </Badge>
                    {selectedItem.isFeatured && (
                      <Badge className="rounded-md bg-amber-400 text-slate-950 hover:bg-amber-400">Premium</Badge>
                    )}
                    {selectedItem.isNew && (
                      <Badge className="rounded-md bg-emerald-700 text-white hover:bg-emerald-700">Nouveau</Badge>
                    )}
                  </div>
                  <DialogTitle className="text-3xl font-black leading-tight md:text-4xl">
                    {selectedItem.title}
                  </DialogTitle>
                  <DialogDescription className="pt-2 text-base leading-7">
                    {selectedItem.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < Math.round(selectedItem.rating) ? "fill-current" : ""}`}
                      />
                    ))}
                    <span className="ml-1 font-black text-foreground">{selectedItem.rating}</span>
                  </div>
                  <span className="text-muted-foreground">{selectedItem.reviews} avis</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedItem.location.prefecture}
                    {selectedItem.location.subPrefecture ? `, ${selectedItem.location.subPrefecture}` : ""}
                  </span>
                </div>

                <div className="mt-8 rounded-lg border bg-muted/30 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Prix</p>
                  <p className="mt-1 text-4xl font-black text-emerald-700">{formatPrice(selectedItem)}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    {selectedItem.delivery || "Retrait ou livraison à confirmer avec ProfGui."}
                  </p>
                </div>

                {selectedItem.highlights && selectedItem.highlights.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-black">Points forts</h3>
                    <div className="mt-4 grid gap-3">
                      {selectedItem.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-start gap-3 rounded-md border bg-background p-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                          <span className="text-sm leading-6">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 rounded-lg border p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Vendeur</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 font-black text-emerald-700">
                      {(selectedItem.author || "ProfGui").charAt(0)}
                    </div>
                    <div>
                      <p className="font-black">{selectedItem.author || "Partenaire ProfGui"}</p>
                      <p className="text-sm text-muted-foreground">Vérifié par ProfGui</p>
                    </div>
                    <ShieldCheck className="ml-auto h-6 w-6 text-emerald-700" />
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <a href={getWhatsAppOrderUrl(selectedItem)} target="_blank" rel="noopener noreferrer">
                    <Button className="h-12 w-full gap-2 rounded-md bg-green-600 font-black text-white hover:bg-green-700">
                      <SiWhatsapp className="h-5 w-5" />
                      Commander
                    </Button>
                  </a>
                  <a href={`tel:${CONTACT_PHONE}`}>
                    <Button variant="outline" className="h-12 w-full gap-2 rounded-md font-black">
                      <Phone className="h-4 w-4" />
                      Appeler
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function ItemCard({
  item,
  onSelect,
  variant = "default",
}: {
  item: MarketplaceItem;
  onSelect: (item: MarketplaceItem) => void;
  variant?: "default" | "featured";
}) {
  const meta = categoryMeta[item.category];
  const Icon = meta.icon;
  const gallery = getGallery(item);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewImage = gallery[previewIndex % gallery.length] || item.image;
  const primaryHighlight = item.highlights?.[0] || item.description;

  useEffect(() => {
    setPreviewIndex(0);
  }, [item.id]);

  useEffect(() => {
    if (gallery.length < 2) return;

    const timer = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % gallery.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [gallery.length]);

  return (
    <button type="button" className="marketplace-perspective text-left" onClick={() => onSelect(item)}>
      <article className="marketplace-card-3d group h-full overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className={`relative overflow-hidden ${variant === "featured" ? "aspect-[4/3]" : "aspect-[1.06/1]"}`}>
          <img
            src={previewImage}
            alt={item.title}
            className="marketplace-product-image h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/68 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge className={`${meta.color} rounded-md border shadow-sm`}>
              <Icon className="mr-1 h-3.5 w-3.5" />
              {meta.shortLabel}
            </Badge>
            {item.isNew && <Badge className="rounded-md bg-emerald-700 text-white">Nouveau</Badge>}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
            <span className="rounded-md bg-white/92 px-3 py-2 text-sm font-black text-slate-950 shadow-sm">
              {formatPrice(item)}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-400 text-slate-950 shadow-sm transition group-hover:bg-emerald-700 group-hover:text-white">
              <ShoppingCart className="h-5 w-5" />
            </span>
          </div>
          {gallery.length > 1 && (
            <div className="absolute right-3 top-3 flex gap-1 rounded-md bg-black/36 p-1 backdrop-blur">
              {gallery.slice(0, 4).map((image, index) => (
                <span
                  key={image}
                  className={`h-1.5 w-5 rounded-full transition ${
                    index === previewIndex % gallery.length ? "bg-amber-300" : "bg-white/46"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1 font-bold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {item.location.prefecture}
            </span>
            <span className="flex items-center gap-1 font-black text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" />
              {item.rating}
            </span>
          </div>
          <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-black leading-tight transition group-hover:text-emerald-700">
            {item.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {primaryHighlight}
          </p>
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <span className="text-sm font-bold text-muted-foreground">
              {item.author || "Partenaire ProfGui"}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">
              Détails
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </button>
  );
}
