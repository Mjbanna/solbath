import { Category } from "./types";
import { tileCategories } from "./tiles.generated";

export const categories: Category[] = [
  // Bathroom Accessories
  {
    slug: "faucets",
    vertical: "bathroom-accessories",
    name: "Faucets & Taps",
    tagline: "Precision-engineered flow, sculpted for the modern bath.",
    description:
      "Single lever mixers, wall-mounted sets and sensor faucets in a range of designer finishes.",
    filters: [
      { label: "Finish", options: ["Chrome", "Matte Black", "Brushed Gold", "Rose Gold"] },
      { label: "Type", options: ["Single Lever", "Wall Mounted", "Sensor"] },
    ],
  },
  {
    slug: "showers",
    vertical: "bathroom-accessories",
    name: "Showers & Panels",
    tagline: "A rainfall moment, engineered for everyday luxury.",
    description:
      "Overhead showers, hand showers and complete shower panels built for pressure and posture.",
    filters: [
      { label: "Finish", options: ["Chrome", "Matte Black", "Brushed Gold"] },
      { label: "Type", options: ["Rain Shower", "Hand Shower", "Shower Panel"] },
    ],
  },
  {
    slug: "sanitaryware",
    vertical: "bathroom-accessories",
    name: "Sanitaryware",
    tagline: "Sculptural forms in vitreous china, built to last.",
    description: "Wall-hung and floor-mounted WCs, wash basins and bidets.",
    filters: [
      { label: "Type", options: ["Wall-Hung WC", "Floor-Mounted WC", "Wash Basin", "Bidet"] },
      { label: "Finish", options: ["White", "Ivory", "Black Matte"] },
    ],
  },

  {
    slug: "towel-racks",
    vertical: "bathroom-accessories",
    name: "Towel Racks & Holders",
    tagline: "Considered storage for every bath.",
    description:
      "Folding, dual and fixed towel racks in stainless steel and aluminium, built for daily use.",
    filters: [
      { label: "Material", options: ["Stainless Steel", "Aluminium"] },
      { label: "Finish", options: ["Chrome", "Black"] },
    ],
  },

  // Hardware
  {
    slug: "door-hardware",
    vertical: "hardware",
    name: "Door Hardware",
    tagline: "Every touchpoint, considered.",
    description: "Handles, hinges, locksets and closers for residential and commercial doors.",
    filters: [
      { label: "Type", options: ["Handles", "Hinges", "Locksets", "Closers"] },
      { label: "Finish", options: ["Matte Black", "Antique Brass", "Stainless Steel"] },
    ],
  },
  {
    slug: "locks-security",
    vertical: "hardware",
    name: "Locks & Security",
    tagline: "Security that feels as good as it looks.",
    description: "Mortise locks, digital smart locks and padlocks for every entry point.",
    filters: [
      { label: "Type", options: ["Mortise Lock", "Digital Lock", "Padlock"] },
      { label: "Finish", options: ["Matte Black", "Stainless Steel", "Antique Brass"] },
    ],
  },

  // Kitchen
  {
    slug: "kitchen-faucets-sinks",
    vertical: "kitchen",
    name: "Kitchen Faucets & Sinks",
    tagline: "Hard-working water zones with a polished, architectural presence.",
    description:
      "Pull-out mixers, workstation sinks and undermount bowls designed for daily prep, rinse and clean-up.",
    filters: [
      { label: "Type", options: ["Pull-Out Mixer", "Undermount Sink", "Workstation Sink"] },
      { label: "Finish", options: ["Chrome", "Brushed Steel", "Matte Black", "Gunmetal"] },
    ],
  },

  // Ceramic Tiles — generated from seed-data/source/tiles_details.xlsx
  ...tileCategories,
];

export const verticalMeta: Record<
  string,
  {
    name: string;
    slug: string;
    tagline: string;
    heroDescription: string;
    tone: "bath" | "tile" | "hardware" | "kitchen";
  }
> = {
  "bathroom-accessories": {
    name: "Bathroom Accessories",
    slug: "bathroom-accessories",
    tagline: "Fittings and fixtures for the modern bath.",
    heroDescription: "Faucets, showers and sanitaryware finished to a designer standard.",
    tone: "bath",
  },
  "ceramic-tiles": {
    name: "Ceramic Tiles",
    slug: "ceramic-tiles",
    tagline: "Surfaces that define a space.",
    heroDescription: "Floor, wall and large-format tiles in every texture and tone.",
    tone: "tile",
  },
  hardware: {
    name: "Hardware",
    slug: "hardware",
    tagline: "Considered details for doors, cabinets and more.",
    heroDescription: "Door, cabinet and security hardware - the details that matter.",
    tone: "hardware",
  },
  kitchen: {
    name: "Kitchen",
    slug: "kitchen",
    tagline: "Fixtures, surfaces and storage for the heart of the home.",
    heroDescription: "Kitchen fittings, surfaces and storage for composed everyday use.",
    tone: "kitchen",
  },
};

export function getCategoriesByVertical(vertical: string) {
  return categories.filter((c) => c.vertical === vertical);
}

export function getCategory(vertical: string, slug: string) {
  return categories.find((c) => c.vertical === vertical && c.slug === slug);
}
