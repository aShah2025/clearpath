export const TARGET_LANGUAGES = [
  { tag: "en", name: "English" },
  { tag: "es", name: "Español" },
  { tag: "zh", name: "中文" },
  { tag: "vi", name: "Tiếng Việt" },
  { tag: "tl", name: "Tagalog" },
  { tag: "ar", name: "العربية" },
  { tag: "ko", name: "한국어" },
  { tag: "ru", name: "Русский" },
  { tag: "ht", name: "Kreyòl Ayisyen" },
  { tag: "pt", name: "Português" },
  { tag: "fr", name: "Français" },
  { tag: "hi", name: "हिन्दी" },
] as const;

export const TARGET_LANGUAGE_TAGS = TARGET_LANGUAGES.map((language) => language.tag) as [string, ...string[]];
