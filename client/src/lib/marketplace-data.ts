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
    image: "https://images.unsplash.com/photo-1543003968-240974628835?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?q=80&w=800&auto=format&fit=crop",
    author: "Tech Academy GN",
    location: { prefecture: "Conakry" },
    rating: 4.6,
    reviews: 89,
    isNew: true,
  },
  {
    id: "6",
    category: "materiel",
    title: "Lot de 10 Cahiers 200 Pages",
    description: "Cahiers de haute qualité, papier blanc, couverture rigide pour une durabilité maximale.",
    price: 85000,
    currency: "GNF",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1543165796-5426273ea4d1?q=80&w=800&auto=format&fit=crop",
    author: "English Hub",
    location: { prefecture: "Mamou" },
    rating: 4.9,
    reviews: 67,
  }
];
