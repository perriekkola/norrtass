const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface BreadcrumbItem {
  title: string;
  url: string;
  uid: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  currentPageTitle: string;
  currentPageUrl: string;
}

export function BreadcrumbSchema({
  items,
  currentPageTitle,
  currentPageUrl,
}: BreadcrumbSchemaProps) {
  // Build the breadcrumb list for schema
  const breadcrumbList = [
    // Add all breadcrumb items
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      item: `${SITE_URL}${item.url}`,
    })),
    // Add current page
    {
      '@type': 'ListItem',
      position: items.length + 1,
      name: currentPageTitle,
      item: `${SITE_URL}${currentPageUrl}`,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbList,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
