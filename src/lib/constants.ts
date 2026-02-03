import {
  Briefcase,
  Home,
  Landmark,
  Shield,
  Scale,
  Palette,
  ScrollText,
  Leaf,
  Factory,
  Coins,
  HeartHandshake,
  Stethoscope,
  TrainFront,
  GraduationCap,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CommitteeInfo {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
}

/** Maps committee codes from the API `organ` field to human-readable Swedish labels. */
export const COMMITTEE_MAP: Record<string, CommitteeInfo> = {
  AU: {
    name: "Arbetsmarknad",
    slug: "arbetsmarknad",
    description: "Arbetsmarknadspolitik, jämställdhet och diskriminering",
    icon: Briefcase,
  },
  CU: {
    name: "Civilrätt",
    slug: "civilratt",
    description: "Civilrätt, bostadspolitik och konsumenträtt",
    icon: Home,
  },
  FiU: {
    name: "Finans",
    slug: "finans",
    description: "Statsbudget, penningpolitik och kommunalekonomi",
    icon: Landmark,
  },
  FöU: {
    name: "Försvar",
    slug: "forsvar",
    description: "Försvarspolitik, militärt försvar och säkerhetspolitik",
    icon: Shield,
  },
  JuU: {
    name: "Justitie",
    slug: "justitie",
    description: "Rättsväsendet, polisen och kriminalpolitik",
    icon: Scale,
  },
  KrU: {
    name: "Kultur",
    slug: "kultur",
    description: "Kulturpolitik, medier och idrott",
    icon: Palette,
  },
  KU: {
    name: "Konstitution",
    slug: "konstitution",
    description: "Grundlagsfrågor, granskning av regeringen",
    icon: ScrollText,
  },
  MJU: {
    name: "Miljö & Jordbruk",
    slug: "miljo-jordbruk",
    description: "Miljöpolitik, klimat, jordbruk och livsmedel",
    icon: Leaf,
  },
  NU: {
    name: "Näringsliv",
    slug: "naringsliv",
    description: "Näringspolitik, energi och regional tillväxt",
    icon: Factory,
  },
  SkU: {
    name: "Skatter",
    slug: "skatter",
    description: "Skattelagstiftning och tullfrågor",
    icon: Coins,
  },
  SfU: {
    name: "Socialförsäkring",
    slug: "socialforsakring",
    description: "Socialförsäkringar, pension och migration",
    icon: HeartHandshake,
  },
  SoU: {
    name: "Socialpolitik",
    slug: "socialpolitik",
    description: "Hälso- och sjukvård, äldreomsorg och funktionshinder",
    icon: Stethoscope,
  },
  TU: {
    name: "Trafik",
    slug: "trafik",
    description: "Transporter, kommunikation och infrastruktur",
    icon: TrainFront,
  },
  UbU: {
    name: "Utbildning",
    slug: "utbildning",
    description: "Förskola, skola, högre utbildning och forskning",
    icon: GraduationCap,
  },
  UU: {
    name: "Utrikes",
    slug: "utrikes",
    description: "Utrikespolitik, internationellt samarbete och bistånd",
    icon: Globe,
  },
};

/** Reverse map: slug → committee code */
export const SLUG_TO_COMMITTEE: Record<string, string> = Object.fromEntries(
  Object.entries(COMMITTEE_MAP).map(([code, info]) => [info.slug, code])
);

export interface PartyInfo {
  name: string;
  hex: string;
  bg: string;
  text: string;
}

/** Party colors and names keyed by API party code. */
export const PARTIES: Record<string, PartyInfo> = {
  S: { name: "Socialdemokraterna", hex: "#E8112D", bg: "bg-[#E8112D]", text: "text-white" },
  M: { name: "Moderaterna", hex: "#52BDEC", bg: "bg-[#52BDEC]", text: "text-gray-900" },
  SD: { name: "Sverigedemokraterna", hex: "#DDDD00", bg: "bg-[#DDDD00]", text: "text-gray-900" },
  KD: { name: "Kristdemokraterna", hex: "#000077", bg: "bg-[#000077]", text: "text-white" },
  L: { name: "Liberalerna", hex: "#006AB3", bg: "bg-[#006AB3]", text: "text-white" },
  C: { name: "Centerpartiet", hex: "#009933", bg: "bg-[#009933]", text: "text-white" },
  MP: { name: "Miljöpartiet", hex: "#83CF39", bg: "bg-[#83CF39]", text: "text-gray-900" },
  V: { name: "Vänsterpartiet", hex: "#DA291C", bg: "bg-[#DA291C]", text: "text-white" },
};

/** Parliamentary sessions in the 2022-2026 mandate period. */
export const SESSIONS = ["2022/23", "2023/24", "2024/25", "2025/26"] as const;
export type Session = (typeof SESSIONS)[number];

/** Riksdagen API base URL. */
export const API_BASE = "https://data.riksdagen.se";
