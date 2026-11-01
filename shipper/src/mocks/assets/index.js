// DEV FIXTURES — placeholder product photography cropped from the Figma design file. Product images
// reach the app as URLs inside API responses (the real backend will return its own image URLs), so
// this module is imported only by the mock fixtures.
const modules = import.meta.glob('./products/*.jpg', { eager: true, import: 'default' })

const productImages = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.replace('./products/', '').replace('.jpg', ''), url]),
)

/** URL for an image key such as 'haldi-card' (see fixtures/catalogData.js). */
export const productImage = (key) => productImages[key]
