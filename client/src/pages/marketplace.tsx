import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  FileText,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  GraduationCap,
  Store,
  Search,
  Star,
  Filter,
  ShoppingCart,
  X,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PREFECTURES } from "@/lib/geography";
import { SUB_PREFECTURES } from "@/lib/subPrefectures";
import { MARKETPLACE_ITEMS, MarketplaceItem, MarketplaceCategory } from "@/lib/marketplace-data";

const categories = [
  { id: "formation" as const, title: "Formations", icon: GraduationCap, color: "bg-blue-500/10 text-blue-600" },
  { id: "document" as const, title: "Documents & Livres", icon: FileText, color: "bg-green-500/10 text-green-600" },
  { id: "materiel" as const, title: "Matériel éducatif", icon: ShoppingBag, color: "bg-purple-500/10 text-purple-600" },
];

const CONTACT_WHATSAPP = "+224629516388";
const CONTACT_PHONE = "+224629516388";
const CONTACT_EMAIL = "contact@profgui.com";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | "all">("all");
  const [prefecture, setPrefecture] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  const filteredItems = useMemo(() => {
    return MARKETPLACE_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesPrefecture = prefecture === "all" || item.location.prefecture === prefecture;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrefecture && matchesSearch;
    });
  }, [selectedCategory, prefecture, searchQuery]);

  const featuredItems = useMemo(() => MARKETPLACE_ITEMS.filter(item => item.isFeatured), []);

  return (
    <Layout>
      <div className="bg-muted/30 pb-20">
        {/* Header Hero */}
        <div className="bg-primary pt-12 pb-24 text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex flex-col items-center text-center">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white backdrop-blur-sm border-none px-4 py-1">
                La place de marché n°1 en Guinée
              </Badge>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
                Tout pour l'Éducation
              </h1>
              <p className="max-w-2xl text-lg text-primary-foreground/80">
                Achetez et vendez des formations, des livres et du matériel pédagogique de qualité partout en Guinée.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Main Controls Card */}
          <div className="-mt-16 mb-12">
            <Card className="border-none shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Search Bar */}
                  <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r">
                    <Search className="h-5 w-5 text-muted-foreground mr-3" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un livre, un cours, un kit..." 
                      className="w-full bg-transparent border-none outline-none text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Prefecture Filter */}
                  <div className="w-full md:w-64 px-6 py-4 border-b md:border-b-0 md:border-r flex items-center">
                    <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                    <Select value={prefecture} onValueChange={setPrefecture}>
                      <SelectTrigger className="border-none shadow-none p-0 focus:ring-0">
                        <SelectValue placeholder="Toute la Guinée" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toute la Guinée</SelectItem>
                        {PREFECTURES.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Category Filter */}
                  <div className="w-full md:w-72 px-6 py-4 flex items-center">
                    <Filter className="h-5 w-5 text-muted-foreground mr-3" />
                    <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as any)}>
                      <SelectTrigger className="border-none shadow-none p-0 focus:ring-0">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block space-y-8">
              <div>
                <h3 className="mb-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Catégories</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setSelectedCategory("all")}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${selectedCategory === "all" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                  >
                    Toutes
                  </button>
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {cat.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10">
                <h4 className="font-bold text-sm mb-2">Vendre ici ?</h4>
                <p className="text-xs text-muted-foreground mb-4">Publiez vos articles et touchez des milliers d'élèves.</p>
                <Link href="/inscription?role=teacher">
                  <Button variant="outline" size="sm" className="w-full text-xs">Commencer</Button>
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Featured Section (only if no active search/filter) */}
              {searchQuery === "" && selectedCategory === "all" && prefecture === "all" && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Sélection Premium</h2>
                    <Badge variant="outline">Recommandé par ProfGui</Badge>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredItems.map(item => (
                      <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Items Grid */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {searchQuery || selectedCategory !== "all" || prefecture !== "all" ? "Résultats" : "Tous les articles"}
                    <span className="ml-3 text-sm font-normal text-muted-foreground">({filteredItems.length})</span>
                  </h2>
                </div>
                
                {filteredItems.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map(item => (
                      <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-background rounded-3xl border-2 border-dashed">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Aucun résultat trouvé</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setPrefecture("all");
                      }}
                      className="mt-4"
                    >
                      Réinitialiser tous les filtres
                    </Button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Floating Contact CTA */}
        <section className="mt-20 mx-auto max-w-7xl px-4 md:px-8 pb-10">
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-none rounded-[2rem] overflow-hidden shadow-2xl">
            <CardContent className="p-10 md:p-16 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Store className="h-64 w-64" />
              </div>
              <div className="max-w-2xl relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Prêt à développer votre boutique ?</h2>
                <p className="text-xl opacity-90 mb-10 leading-relaxed">
                  Nous aidons les professionnels de l'éducation à digitaliser leurs ventes. Rejoignez la révolution éducative en Guinée.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={`https://wa.me/${CONTACT_WHATSAPP.replace("+", "")}`} className="flex-1 min-w-[200px]">
                    <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 gap-3 text-lg font-bold h-14 rounded-xl">
                      <SiWhatsapp className="h-6 w-6" />
                      Contact WhatsApp
                    </Button>
                  </a>
                  <a href={`tel:${CONTACT_PHONE}`} className="flex-1 min-w-[200px]">
                    <Button size="lg" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 gap-3 text-lg font-bold h-14 rounded-xl">
                      <Phone className="h-6 w-6" />
                      Nous appeler
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
          {selectedItem && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
              <div className="md:w-1/2 relative h-[300px] md:h-auto">
                <img src={selectedItem.image} alt={selectedItem.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-md px-3 py-1 font-bold">
                    {categories.find(c => c.id === selectedItem.category)?.title}
                  </Badge>
                </div>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(selectedItem.rating) ? "fill-current" : ""}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">({selectedItem.reviews} avis)</span>
                  </div>
                  <h2 className="text-3xl font-bold leading-tight mb-2">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 text-primary font-medium mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {selectedItem.location.prefecture}
                      {selectedItem.location.subPrefecture ? `, ${selectedItem.location.subPrefecture}` : ""}
                    </span>
                  </div>
                  <div className="text-4xl font-black text-foreground mb-6">
                    {selectedItem.price.toLocaleString()} {selectedItem.currency}
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.author && (
                  <div className="mb-8 p-4 rounded-xl bg-muted/50 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {selectedItem.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vendeur</div>
                      <div className="font-bold">{selectedItem.author}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto bg-white border-green-200 text-green-700">Vérifié</Badge>
                  </div>
                )}

                <div className="mt-auto space-y-4">
                  <a href={`https://wa.me/${CONTACT_WHATSAPP.replace("+", "")}?text=Bonjour, je suis intéressé par l'article "${selectedItem.title}" sur ProfGui Marketplace.`}>
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 h-16 rounded-2xl text-lg font-bold gap-3 text-white">
                      <SiWhatsapp className="h-6 w-6" />
                      Commander via WhatsApp
                    </Button>
                  </a>
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold" onClick={() => setSelectedItem(null)}>
                    Retour au catalogue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function ItemCard({ item, onSelect }: { item: MarketplaceItem, onSelect: (item: MarketplaceItem) => void }) {
  return (
    <Card 
      className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-none bg-background/60 backdrop-blur-sm cursor-pointer"
      onClick={() => onSelect(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <Button variant="secondary" className="w-full font-bold shadow-xl">Voir les détails</Button>
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.isNew && (
            <Badge className="bg-primary text-primary-foreground border-none font-bold">NOUVEAU</Badge>
          )}
          {item.isFeatured && (
            <Badge className="bg-amber-500 text-white border-none font-bold uppercase tracking-tighter">Premium</Badge>
          )}
        </div>
      </div>
      <CardContent className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
            {item.category === "formation" ? "Cours" : item.category === "document" ? "Livre" : "Matériel"}
          </span>
          <div className="h-px flex-1 bg-muted" />
        </div>
        <h3 className="text-xl font-extrabold line-clamp-2 leading-tight mb-3 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium">
            <MapPin className="h-3 w-3" />
            {item.location.prefecture}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-foreground">{item.rating}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 border-t mt-auto">
        <div className="flex w-full items-center justify-between mt-4">
          <div className="text-2xl font-black text-foreground">
            {item.price.toLocaleString()} <span className="text-xs font-normal">GNF</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
