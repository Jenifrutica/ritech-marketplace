/** Imágenes libres de Wikimedia Commons descargadas en public/images. Las licencias CC BY y CC BY-SA exigen atribución. */
export type ImageId =
  | "galeras"
  | "cafe-flor"
  | "cereza-cafe"
  | "cereza-abierta"
  | "cafetal"
  | "finca-cafe"
  | "cafe-verde"
  | "sacos-cafe"
  | "cacao-mazorcas"
  | "cacao-fruto";

export type ImageCredit = {
  id: ImageId;
  file: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  alt: { es: string; en: string };
};

export const imageCredits: ImageCredit[] = [
  {"id": "galeras", "file": "Volcán Galeras (35).jpg", "author": "IShosholoza", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "source": "https://commons.wikimedia.org/wiki/File:Volc%C3%A1n_Galeras_(35).jpg", "alt": {"es": "Volcán Galeras visto desde Pasto, Nariño", "en": "Galeras volcano seen from Pasto, Nariño"}},
  {"id": "cafe-flor", "file": "Café en Flor.jpg", "author": "MARIO ALFONSO GUDIÑO DAVILA", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "source": "https://commons.wikimedia.org/wiki/File:Caf%C3%A9_en_Flor.jpg", "alt": {"es": "Cafeto en flor con hojas verdes", "en": "Coffee plant in bloom with green leaves"}},
  {"id": "cereza-cafe", "file": "Coffee arabica cherry.jpg", "author": "Roger Burger", "license": "CC0", "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en", "source": "https://commons.wikimedia.org/wiki/File:Coffee_arabica_cherry.jpg", "alt": {"es": "Cerezas de café maduras en la rama", "en": "Ripe coffee cherries on the branch"}},
  {"id": "cereza-abierta", "file": "Open coffee cherry.jpg", "author": "Roger Burger", "license": "CC0", "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en", "source": "https://commons.wikimedia.org/wiki/File:Open_coffee_cherry.jpg", "alt": {"es": "Mano sosteniendo cerezas de café abiertas con sus granos", "en": "Hand holding opened coffee cherries with their beans"}},
  {"id": "cafetal", "file": "Coffee plantation in Cachipay, Colombia.jpg", "author": "Felipe Quijano", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "source": "https://commons.wikimedia.org/wiki/File:Coffee_plantation_in_Cachipay,_Colombia.jpg", "alt": {"es": "Cafetal bajo sombra de árboles", "en": "Shade-grown coffee plantation"}},
  {"id": "finca-cafe", "file": "Coffee farm in Colombia (4604545436).jpg", "author": "U. S. Fish and Wildlife Service - Northeast Region", "license": "Public domain", "licenseUrl": "", "source": "https://commons.wikimedia.org/wiki/File:Coffee_farm_in_Colombia_(4604545436).jpg", "alt": {"es": "Surcos de café en una finca de Colombia", "en": "Rows of coffee on a farm in Colombia"}},
  {"id": "cafe-verde", "file": "Green Bean Coffee.jpg", "author": "DeaPeaJay", "license": "CC BY-SA 2.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0", "source": "https://commons.wikimedia.org/wiki/File:Green_Bean_Coffee.jpg", "alt": {"es": "Saco de fique con café verde", "en": "Jute sack with green coffee beans"}},
  {"id": "sacos-cafe", "file": "NP coffee sacks (5867722798).jpg", "author": "CIAT", "license": "CC BY-SA 2.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0", "source": "https://commons.wikimedia.org/wiki/File:NP_coffee_sacks_(5867722798).jpg", "alt": {"es": "Productora cargando sacos de café", "en": "Coffee producer carrying coffee sacks"}},
  {"id": "cacao-mazorcas", "file": "Cacao pods.jpg", "author": "FranHogan", "license": "CC BY-SA 4.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0", "source": "https://commons.wikimedia.org/wiki/File:Cacao_pods.jpg", "alt": {"es": "Mazorcas de cacao verdes en el árbol", "en": "Green cacao pods on the tree"}},
  {"id": "cacao-fruto", "file": "Theobroma cacao fruit.jpg", "author": "Bernard Gagnon", "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0", "source": "https://commons.wikimedia.org/wiki/File:Theobroma_cacao_fruit.jpg", "alt": {"es": "Mazorca de cacao madura en el árbol", "en": "Ripe cacao pod on the tree"}},
];

export const imageById = Object.fromEntries(imageCredits.map((c) => [c.id, c])) as Record<ImageId, ImageCredit>;

export function imageSrc(id: string): string {
  return `${import.meta.env.BASE_URL}images/${id}.jpg`;
}
