'use client';

import { Fragment } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { DEFAULT_LOCALE } from '@/lib/locales';

import { PageDocument } from '../../prismicio-types';
import { BreadcrumbSchema } from './breadcrumb-schema';

interface BreadcrumbItem {
  title: string;
  url: string;
  uid: string;
}

export function Breadcrumbs({
  currentPage,
  homePageData,
  locale,
}: {
  currentPage: PageDocument;
  homePageData: PageDocument | null;
  locale: string;
}) {
  // Build breadcrumb items array
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Add home page (only if we have the data)
  if (homePageData) {
    // Use "/" for default locale, keep locale-specific URLs for others
    const homeUrl = locale === DEFAULT_LOCALE ? '/' : homePageData.url;

    breadcrumbItems.push({
      title: homePageData.data.page_title || 'Home',
      url: homeUrl || '/',
      uid: 'home',
    });
  }

  // Add parent pages if they exist
  if (
    currentPage.data.parent &&
    isFilled.contentRelationship(currentPage.data.parent)
  ) {
    const parent = currentPage.data.parent;

    // Add grandparent if it exists
    if (
      parent.data?.parent &&
      isFilled.contentRelationship(parent.data.parent)
    ) {
      const grandparent = parent.data.parent;
      breadcrumbItems.push({
        title: grandparent.data?.page_title || 'Unknown',
        url: grandparent.url || '/',
        uid: grandparent.uid || 'unknown',
      });
    }

    // Add parent
    breadcrumbItems.push({
      title: parent.data?.page_title || 'Unknown',
      url: parent.url || '/',
      uid: parent.uid || 'unknown',
    });
  }

  // Don't show breadcrumbs if we're on the home page
  if (currentPage.uid === 'home') {
    return null;
  }

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <BreadcrumbSchema
        items={breadcrumbItems}
        currentPageTitle={currentPage.data.page_title || 'Unknown'}
        currentPageUrl={currentPage.url || '/'}
      />

      {/* Visual Breadcrumbs */}
      <div className="container pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.uid}>
                <BreadcrumbItem className="max-w-[100px] truncate">
                  <BreadcrumbLink asChild>
                    <PrismicNextLink href={item.url}>
                      {item.title}
                    </PrismicNextLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator key={`separator-${item.uid}`} />
                )}
              </Fragment>
            ))}

            {/* Separator before current page */}
            {breadcrumbItems.length > 0 && (
              <BreadcrumbSeparator key="separator-current" />
            )}

            {/* Current page */}
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[100px] truncate">
                {currentPage.data.page_title || 'Unknown'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
}
