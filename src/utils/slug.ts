export function slugify(text: string): string {
  const cyrillicToLatin: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya',
    ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h'
  };

  const specialChars: Record<string, string> = {
    "o'": 'o',
    "g'": 'g',
    "o‘": 'o',
    "g‘": 'g',
    "oʻ": 'o',
    "gʻ": 'g',
  };

  let slug = text.toLowerCase().trim();

  // Handle special Latin Uzbek characters first
  Object.keys(specialChars).forEach((key) => {
    slug = slug.replace(new RegExp(key, 'g'), specialChars[key]);
  });

  // Handle Cyrillic
  slug = slug.split('').map(char => cyrillicToLatin[char] || char).join('');

  return slug
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}
