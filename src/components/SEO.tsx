import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
}

const getCanonical = (canonical?: string) => {
  if (canonical) return canonical;
  if (typeof window !== "undefined") return window.location.href;
  return undefined;
};

export const SEO = ({ title, description, canonical, image, noIndex }: SEOProps) => {
  const can = getCanonical(canonical);
  const metaTitle = title.slice(0, 58);
  const metaDescription = description?.slice(0, 158);

  return (
    <Helmet>
      <title>{metaTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {can && <link rel="canonical" href={can} />}

      <meta property="og:title" content={metaTitle} />
      {metaDescription && (
        <meta property="og:description" content={metaDescription} />
      )}
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      {metaDescription && (
        <meta name="twitter:description" content={metaDescription} />
      )}
      {image && <meta name="twitter:image" content={image} />}

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEO;
