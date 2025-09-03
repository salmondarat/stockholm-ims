import en from "./en";
import id from "./id";

export type Lang = "en" | "id";
export type Dict = typeof en;

export const dictionaries: Record<Lang, Dict> = { en, id };

export function getDict(lang: Lang): Dict {
  return dictionaries[lang] || en;
}

