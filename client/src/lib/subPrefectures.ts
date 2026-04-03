import type { GuineaSubPrefecture } from "./geography";

/**
 * Static list of sub-prefectures / communes.
 * Sources: Wikipedia "Sub-prefectures of Guinea" + Statoids "Guinea Subprefectures".
 * NOTE: This list is intentionally partial for now and should be expanded to cover all ~365 sub-prefectures.
 */
export const SUB_PREFECTURES: GuineaSubPrefecture[] = [
  // Conakry (urban sub-prefectures / communes)
  { name: "Kaloum", prefecture: "Conakry" },
  { name: "Dixinn", prefecture: "Conakry" },
  { name: "Matam", prefecture: "Conakry" },
  { name: "Ratoma", prefecture: "Conakry" },
  { name: "Matoto", prefecture: "Conakry" },

  // Dabola Prefecture
  { name: "Arfamoussaya", prefecture: "Dabola" },
  { name: "Banko", prefecture: "Dabola" },
  { name: "Bissikrima", prefecture: "Dabola" },
  { name: "Dabola-Centre (urban)", prefecture: "Dabola" },
  { name: "Dogomet", prefecture: "Dabola" },
  { name: "Kankama", prefecture: "Dabola" },
  { name: "Kindoyé", prefecture: "Dabola" },
  { name: "Konendou", prefecture: "Dabola" },
  { name: "N'Déma", prefecture: "Dabola" },

  // Dinguiraye Prefecture
  { name: "Banora", prefecture: "Dinguiraye" },
  { name: "Dialakoro", prefecture: "Dinguiraye" },
  { name: "Diatifèrè", prefecture: "Dinguiraye" },
  { name: "Dinguiraye-Centre (urban)", prefecture: "Dinguiraye" },
  { name: "Gagnakaly", prefecture: "Dinguiraye" },
  { name: "Kalinko", prefecture: "Dinguiraye" },
  { name: "Lansanaya", prefecture: "Dinguiraye" },
  { name: "Sélouma", prefecture: "Dinguiraye" },

  // Faranah Prefecture
  { name: "Banian", prefecture: "Faranah" },
  { name: "Beindou", prefecture: "Faranah" },
  { name: "Faranah-Centre (urban)", prefecture: "Faranah" },
  { name: "Gnaléah", prefecture: "Faranah" },
  { name: "Hérémakonon", prefecture: "Faranah" },
  { name: "Kobikoro", prefecture: "Faranah" },
  { name: "Marela", prefecture: "Faranah" },
  { name: "Passaya", prefecture: "Faranah" },
  { name: "Sandéniyah", prefecture: "Faranah" },
  { name: "Songoyah", prefecture: "Faranah" },
  { name: "Tiro", prefecture: "Faranah" },
  { name: "Tindo", prefecture: "Faranah" },

  // Kissidougou Prefecture (partial)
  { name: "Albadariah", prefecture: "Kissidougou" },
  { name: "Banama", prefecture: "Kissidougou" },
  { name: "Bardou", prefecture: "Kissidougou" },
  { name: "Beindou", prefecture: "Kissidougou" },
  { name: "Fermessadou-Pombo", prefecture: "Kissidougou" },

  // Boffa Prefecture
  { name: "Boffa-Centre (urban)", prefecture: "Boffa" },
  { name: "Colia", prefecture: "Boffa" },
  { name: "Douprou", prefecture: "Boffa" },
  { name: "Koba-Tatema", prefecture: "Boffa" },
  { name: "Lisso", prefecture: "Boffa" },
  { name: "Mankountan", prefecture: "Boffa" },
  { name: "Tamita", prefecture: "Boffa" },
  { name: "Tougnifily", prefecture: "Boffa" },

  // Boké Prefecture
  { name: "Bintimodia", prefecture: "Boké" },
  { name: "Boké-Centre (urban)", prefecture: "Boké" },
  { name: "Dabiss", prefecture: "Boké" },
  { name: "Kamsar (urban)", prefecture: "Boké" },
  { name: "Kanfarandé", prefecture: "Boké" },
  { name: "Kolaboui", prefecture: "Boké" },
  { name: "Malapouyah", prefecture: "Boké" },
  { name: "Sangarédi (urban)", prefecture: "Boké" },
  { name: "Sansalé", prefecture: "Boké" },
  { name: "Tanènè", prefecture: "Boké" },

  // Fria Prefecture
  { name: "Banguinet", prefecture: "Fria" },
  { name: "Banguingny", prefecture: "Fria" },
  { name: "Fria-Centre (urban)", prefecture: "Fria" },
  { name: "Tormelin", prefecture: "Fria" },

  // Gaoual Prefecture
  { name: "Foulamory", prefecture: "Gaoual" },
  { name: "Gaoual-Centre (urban)", prefecture: "Gaoual" },
  { name: "Kakony", prefecture: "Gaoual" },
  { name: "Koumbia", prefecture: "Gaoual" },
  { name: "Kounsitel", prefecture: "Gaoual" },
  { name: "Malanta", prefecture: "Gaoual" },
  { name: "Touba", prefecture: "Gaoual" },
  { name: "Wendou M'Bour", prefecture: "Gaoual" },

  // Koundara Prefecture (partial)
  { name: "Guingan", prefecture: "Koundara" },
];
