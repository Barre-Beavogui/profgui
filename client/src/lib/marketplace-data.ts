import { GraduationCap, FileText, ShoppingBag } from "lucide-react";

export type MarketplaceCategory = "formation" | "document" | "materiel";

export interface MarketplaceItem {
  id: string;
  category: MarketplaceCategory;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  gallery?: string[];
  highlights?: string[];
  delivery?: string;
  author?: string;
  location: {
    prefecture: string;
    subPrefecture?: string;
  };
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "1",
    category: "document",
    title: "Guide Complet du Baccalauréat - Mathématiques",
    description: "Toutes les annales corrigées des 10 dernières années avec des explications détaillées pour réussir votre Bac.",
    price: 45000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Annales corrigées avec méthode détaillée.",
      "Exercices classés par chapitre pour réviser plus vite.",
      "Format adapté aux élèves de Terminale.",
    ],
    delivery: "Version papier à retirer à Conakry ou livraison à confirmer.",
    author: "Prof. Amadou Diallo",
    location: { prefecture: "Conakry", subPrefecture: "Ratoma" },
    rating: 4.8,
    reviews: 124,
    isFeatured: true,
  },
  {
    id: "2",
    category: "formation",
    title: "Atelier Intensif de Physique-Chimie",
    description: "Session de préparation intensive pour le Brevet. Cours en présentiel à Conakry.",
    price: 150000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1581093458791-9d2f5f0d7d4f?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Préparation intensive avec exercices pratiques.",
      "Groupe limité pour garder un bon suivi.",
      "Supports fournis pendant l'atelier.",
    ],
    delivery: "Formation en présentiel à Dixinn, inscription via ProfGui.",
    author: "Centre Excellence",
    location: { prefecture: "Conakry", subPrefecture: "Dixinn" },
    rating: 4.9,
    reviews: 45,
    isNew: true,
  },
  {
    id: "3",
    category: "materiel",
    title: "Kit Scientifique Découverte",
    description: "Kit complet pour réaliser plus de 20 expériences de chimie à la maison. Sécurisé et éducatif.",
    price: 275000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Matériel pédagogique pour expériences encadrées.",
      "Adapté aux curieux du collège et du lycée.",
      "Conseils d'utilisation inclus.",
    ],
    delivery: "Expédition possible depuis Boké selon disponibilité.",
    location: { prefecture: "Boké", subPrefecture: "Kamsar (urban)" },
    rating: 4.7,
    reviews: 32,
    isFeatured: true,
  },
  {
    id: "4",
    category: "document",
    title: "Bescherelle Français - Edition Guinée",
    description: "La référence pour la conjugaison et la grammaire, indispensable pour tous les niveaux.",
    price: 35000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Grammaire et conjugaison expliquées simplement.",
      "Utile du collège au lycée.",
      "Support de révision durable.",
    ],
    delivery: "Retrait à Labé ou livraison à organiser.",
    location: { prefecture: "Labé" },
    rating: 4.5,
    reviews: 210,
  },
  {
    id: "5",
    category: "formation",
    title: "Formation Excel pour Étudiants",
    description: "Maîtrisez les tableurs pour vos projets académiques et professionnels. Formation en ligne.",
    price: 100000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Tableaux, formules, graphiques et suivi de projet.",
      "Formation adaptée aux étudiants et débutants.",
      "Accès en ligne avec exercices guidés.",
    ],
    delivery: "Formation en ligne, accès transmis après confirmation.",
    author: "Tech Academy GN",
    location: { prefecture: "Conakry" },
    rating: 4.6,
    reviews: 89,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "6",
    category: "materiel",
    title: "Lot de 10 Cahiers 200 Pages",
    description: "Cahiers de haute qualité, papier blanc, couverture rigide pour une durabilité maximale.",
    price: 85000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Lot économique pour l'année scolaire.",
      "Papier blanc et couverture résistante.",
      "Adapté aux élèves et centres de soutien.",
    ],
    delivery: "Disponible à Kankan, livraison à confirmer.",
    location: { prefecture: "Kankan" },
    rating: 4.4,
    reviews: 156,
  },
  {
    id: "7",
    category: "document",
    title: "Carte du Monde Géante - Murale",
    description: "Grande carte plastifiée pour décorer la chambre et apprendre la géographie.",
    price: 120000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Format mural pour classe ou chambre.",
      "Support plastifié plus résistant.",
      "Idéal pour les révisions de géographie.",
    ],
    delivery: "Retrait à Kaloum ou livraison à Conakry.",
    location: { prefecture: "Conakry", subPrefecture: "Kaloum" },
    rating: 4.8,
    reviews: 28,
  },
  {
    id: "8",
    category: "formation",
    title: "Cours d'Anglais Parlé (Niveau Débutant)",
    description: "Apprenez à parler anglais avec confiance. Focus sur la communication orale.",
    price: 250000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1543165796-5426273ea4d1?auto=format&fit=crop&w=1000&q=86",
    gallery: [
      "https://images.unsplash.com/photo-1543165796-5426273ea4d1?auto=format&fit=crop&w=1000&q=86",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=84",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=84",
    ],
    highlights: [
      "Expression orale, vocabulaire et confiance.",
      "Niveau débutant avec progression guidée.",
      "Format adapté aux élèves et adultes.",
    ],
    delivery: "Cours à Mamou, planning à confirmer avec ProfGui.",
    author: "English Hub",
    location: { prefecture: "Mamou" },
    rating: 4.9,
    reviews: 67,
  }
];
