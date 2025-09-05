import en from "./en";
import id from "./id";

export type Lang = "en" | "id";

// Deeply widen literal types (e.g., specific strings, tuples) to general shapes
type DeepWiden<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepWiden<U>> :
  T extends Array<infer U> ? ReadonlyArray<DeepWiden<U>> :
  T extends object ? { readonly [K in keyof T]: DeepWiden<T[K]> } :
  T;

export type Dict = DeepWiden<typeof en>;

export const dictionaries: Record<Lang, Dict> = { en, id } as const;

export function getDict(lang: Lang): Dict {
  return dictionaries[lang] || en;
}
