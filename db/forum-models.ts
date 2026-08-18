export type ArticleSection =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "callout"; tone: "notice" | "warning"; title: string; text: string }
  | { type: "table"; caption?: string; columns: string[]; rows: string[][] }
  | { type: "process"; title?: string; steps: { label: string; detail?: string }[] }
  | { type: "officialImage"; url: string; alt: string; sourceUrl: string; attribution: string };

export type TopicSignals = {
  officialAnnouncements: number;
  deadline?: string;
  searchInterest?: "rising" | "steady";
  noResultSearches?: string[];
};

export type ContentJobInput = {
  promptTemplateId?: number;
  instruction?: string;
  selectedSectionIndexes?: number[];
  sourceIds?: number[];
};
