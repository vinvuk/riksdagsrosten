/** A member of the Riksdag. */
export interface Member {
  intressent_id: string;
  tilltalsnamn: string;
  efternamn: string;
  parti: string;
  valkrets: string;
  kon: string | null;
  fodd_ar: number | null;
  bild_url: string | null;
  status: string | null;
}

/** A committee report (betänkande). */
export interface Document {
  dok_id: string;
  beteckning: string;
  rm: string;
  organ: string;
  titel: string;
  datum: string | null;
  beslutsdag: string | null;
  dokument_url: string | null;
}

/** A proposal point within a betänkande. */
export interface Proposal {
  dok_id: string;
  punkt: number;
  rubrik: string | null;
  forslag: string | null;
  beslutstyp: string | null;
  votering_id: string | null;
}

/** An aggregated voting event (one per unique votering_id). */
export interface VotingEvent {
  votering_id: string;
  dok_id: string;
  punkt: number;
  beteckning: string;
  rm: string;
  organ: string;
  rubrik: string | null;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
  datum: string | null;
  summary: string | null;
}

/** A single MP's vote on a voting event. */
export interface VoteRecord {
  votering_id: string;
  intressent_id: string;
  rost: "Ja" | "Nej" | "Avstår" | "Frånvarande";
}

/** Pre-computed party-level vote summary for a voting event. */
export interface PartyVoteSummary {
  parti: string;
  votering_id: string;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
}

/** An entry in the Fuse.js search index. */
export interface SearchEntry {
  id: string;
  type: "ledamot" | "votering" | "amne";
  label: string;
  sublabel: string;
  url: string;
  parti?: string;
  organ?: string;
}

/** An MP's vote joined with voting event metadata (for display). */
export interface MpVoteRow {
  votering_id: string;
  rost: string;
  beteckning: string;
  organ: string;
  rubrik: string | null;
  titel: string;
  datum: string | null;
}

/** An individual MP's vote within a specific voting event (for detail view). */
export interface MpVoteInEvent {
  intressent_id: string;
  tilltalsnamn: string;
  efternamn: string;
  parti: string;
  rost: string;
}

/** VotingEvent enriched with document title for list display. */
export interface VotingEventWithTitle extends VotingEvent {
  titel: string;
}

/** Stats for the home page or MP profile. */
export interface VoteStats {
  totalVotes: number;
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
  attendance: number;
}
