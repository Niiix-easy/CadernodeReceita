import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  recipe?: {
    name: string;
    description: string;
    image?: string;
    prepTime?: string;
    servings?: number;
    ingredients?: string[];
    steps?: string[];
    category?: string;
  };
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = "/pwa-512x512.png",
  url = typeof window !== "undefined" ? window.location.href : "https://caderno-de-receitas.app",
  type = "article",
  recipe,
}) => {
  const fullTitle = `${title} | Caderno de Receitas`;
  const siteName = "Caderno de Receitas";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://caderno-de-receitas.app";

  const dynamicOgUrl = `${origin}/api/og-image?title=${encodeURIComponent(title)}&category=${encodeURIComponent(recipe?.category || "Culinária")}&time=${encodeURIComponent(recipe?.prepTime || "20-30 min")}`;
  const defaultImage = image && image !== "/pwa-512x512.png" ? (image.startsWith("http") ? image : `${origin}${image}`) : dynamicOgUrl;

  // Schema.org Structured Data (JSON-LD)
  const schemaData = recipe
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.name,
        description: recipe.description,
        image: [defaultImage],
        recipeCategory: recipe.category || "Culinária",
        prepTime: recipe.prepTime ? `PT${recipe.prepTime.replace(/\D/g, "")}M` : undefined,
        recipeYield: recipe.servings ? `${recipe.servings} porções` : undefined,
        recipeIngredient: recipe.ingredients || [],
        recipeInstructions: (recipe.steps || []).map((step, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          text: step,
        })),
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: siteName,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "All",
        description: description,
      };

  return (
    <Helmet>
      {/* Standard HTML Title & Description */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* OpenGraph Metadata (Facebook, WhatsApp, Instagram, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />

      {/* Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};
