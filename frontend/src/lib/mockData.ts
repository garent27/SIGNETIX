import type { Category, Gloss, Module } from "./types";

// Mirrors the backend seed so the UI is fully explorable even when the API is
// offline (screenshots, demos). The 20 glosses match assets2/label_map.json.
export const MOCK_GLOSS_NAMES = [
  "apa_khabar",
  "assalamualaikum",
  "baik",
  "beli",
  "buat",
  "emak_saudara",
  "hi",
  "jahat",
  "jangan",
  "kereta",
  "lemak",
  "main",
  "marah",
  "nasi",
  "nasi_lemak",
  "panas",
  "pandai_2",
  "pinjam",
  "pukul",
  "ribut",
];

export const MOCK_GLOSSES: Gloss[] = MOCK_GLOSS_NAMES.map((name, i) => ({
  id: i + 1,
  name,
  link: `https://www.google.com/search?q=BIM+sign+language+${encodeURIComponent(
    name.replace(/_/g, " ")
  )}`,
}));

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Everyday Greetings",
    description:
      "Open any conversation with warmth — greetings and check-ins you'll use every single day.",
    image: "/brand/background/background1.jpg",
    status: 1,
    quantity: 3,
  },
  {
    id: 2,
    name: "Food & Cravings",
    description:
      "Order, share and talk about Malaysian food — starting with the nation's favourite plate.",
    image: "/brand/background/background4.jpg",
    status: 1,
    quantity: 3,
  },
  {
    id: 3,
    name: "Out & About",
    description:
      "Everyday errands and getting around — borrowing, buying and moving through your day.",
    image: "/brand/background/background3.jpg",
    status: 1,
    quantity: 3,
  },
  {
    id: 4,
    name: "Feelings & Conduct",
    description:
      "Name emotions and set gentle boundaries — the signs that carry the most meaning.",
    image: "/brand/background/background2.jpg",
    status: 1,
    quantity: 3,
  },
  {
    id: 5,
    name: "Weather Talk",
    description:
      "Small talk that always works — describing the heat and the storms of the day.",
    image: "https://placehold.co/640x420/121A2E/3D8BFF/png?text=Weather",
    status: 1,
    quantity: 3,
  },
];

export const MOCK_MODULES: Module[] = [
  { id: 1, category_id: 1, gloss_sentence: "hi apa_khabar", sentence: "Hi, how are you?", difficulty: "E" },
  { id: 2, category_id: 1, gloss_sentence: "assalamualaikum", sentence: "Peace be upon you.", difficulty: "E" },
  { id: 3, category_id: 1, gloss_sentence: "apa_khabar baik", sentence: "How are you? I'm fine.", difficulty: "M" },
  { id: 4, category_id: 2, gloss_sentence: "beli nasi_lemak", sentence: "Buy nasi lemak.", difficulty: "E" },
  { id: 5, category_id: 2, gloss_sentence: "nasi panas", sentence: "The rice is hot.", difficulty: "M" },
  { id: 6, category_id: 2, gloss_sentence: "beli nasi", sentence: "Buy some rice.", difficulty: "E" },
  { id: 7, category_id: 3, gloss_sentence: "pinjam kereta", sentence: "Borrow the car.", difficulty: "M" },
  { id: 8, category_id: 3, gloss_sentence: "beli kereta", sentence: "Buy a car.", difficulty: "E" },
  { id: 9, category_id: 3, gloss_sentence: "jangan main kereta", sentence: "Don't play with the car.", difficulty: "H" },
  { id: 10, category_id: 4, gloss_sentence: "jangan marah", sentence: "Don't be angry.", difficulty: "M" },
  { id: 11, category_id: 4, gloss_sentence: "pandai_2 baik", sentence: "Clever and well-behaved.", difficulty: "M" },
  { id: 12, category_id: 4, gloss_sentence: "jangan jahat", sentence: "Don't be naughty.", difficulty: "M" },
  { id: 13, category_id: 5, gloss_sentence: "panas", sentence: "It's hot.", difficulty: "E" },
  { id: 14, category_id: 5, gloss_sentence: "ribut", sentence: "A storm is coming.", difficulty: "E" },
  { id: 15, category_id: 5, gloss_sentence: "panas ribut", sentence: "Hot now, stormy later.", difficulty: "M" },
];
