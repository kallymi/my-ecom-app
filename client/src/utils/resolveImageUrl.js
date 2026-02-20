const API_URL = "http://localhost:5000";

export const resolveImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "https://placehold.co/400x500?text=No+Image";
  }

  // URL absolue (Cloudinary, CDN, etc.)
  if (image.startsWith("http")) {
    return image;
  }

  // Nettoyage du chemin
  let cleanPath = image.replace(/^\/+/, "");

  // Forcer uploads si absent
  if (!cleanPath.startsWith("uploads/")) {
    cleanPath = `uploads/${cleanPath}`;
  }

  return `${API_URL}/${cleanPath}`;
};
