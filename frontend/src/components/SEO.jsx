import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * Advanced SEO Component with comprehensive meta tags
 * Supports Open Graph, Twitter Cards, and JSON-LD structured data
 */
const SEO = ({
  title = 'Hypz - Modern Object Storage Solution',
  description = 'Hypz provides secure, scalable, and cost-effective object storage powered by Backblaze B2. Perfect for developers, businesses, and enterprises.',
  keywords = 'object storage, cloud storage, backblaze b2, s3 compatible, file storage, cdn, api storage, scalable storage, secure storage, developer storage',
  author = 'Hypz',
  url = 'https://hypz.io',
  image = 'https://hypz.io/og-image.jpg',
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
  canonicalUrl,
  structuredData,
}) => {
  const siteUrl = 'https://hypz.io';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // Default structured data for the organization
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hypz',
    description: 'Modern Object Storage Solution',
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    sameAs: [
      'https://twitter.com/hypz',
      'https://github.com/hypz',
      'https://linkedin.com/company/hypz',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@hypz.io',
      url: `${siteUrl}/contact`,
    },
  };

  // Merge custom structured data with defaults
  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl || fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Hypz" />
      <meta property="og:locale" content="en_US" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@hypz" />
      <meta name="twitter:site" content="@hypz" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Hypz" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Geographic Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />

      {/* Business/Company Tags */}
      <meta name="rating" content="General" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="target" content="all" />
      <meta name="audience" content="all" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  author: PropTypes.string,
  url: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  section: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  noIndex: PropTypes.bool,
  canonicalUrl: PropTypes.string,
  structuredData: PropTypes.object,
};

export default SEO;
