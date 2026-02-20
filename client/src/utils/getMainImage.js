import { API_URL } from "../config";

export const getMainImage = (product) => {
  if (!product) {
    return "https://placehold.co/200x200?text=No+Image";
  }

  // 1. Cas nouveau système (images[])
  if (Array.isArray(product.images) && product.images.length > 0) {
    const mainImage =
      product.images.find(img => img.isMain) || product.images[0];

    if (mainImage?.url) {
      return mainImage.url.startsWith("http")
        ? mainImage.url
        : `${API_URL}${mainImage.url}`;
    }
  }

  // 2. Ancien système (image simple)
  if (typeof product.image === "string") {
    return product.image.startsWith("http")
      ? product.image
      : `${API_URL}/${product.image.replace(/^\//, "")}`;
  }

  // 3. Fallback
  return "https://placehold.co/200x200?text=No+Image";
};
