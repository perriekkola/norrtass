'use client';

import React from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import SVG from 'react-inlinesvg';

import { useCookieBanner } from '@/components/cookie-banner-context';
import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { ModeToggle } from '@/components/mode-toggle';
import { CustomSVG } from '@/components/svg';
import { Button } from '@/components/ui/button';

import {
  FooterDocument,
  FooterDocumentDataSocialMediaItem,
} from '../../prismicio-types';

const Footer = ({ prismicData }: { prismicData: FooterDocument }) => {
  const { showCookieBanner } = useCookieBanner();

  return (
    <footer className="bg-muted dark:bg-muted/20 mt-12 border-t pt-12 lg:mt-24 lg:pt-20">
      <Container>
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full max-w-md flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            {prismicData.data.logo && prismicData.data.logo.url && (
              <div className="flex items-center gap-2 lg:justify-start">
                <PrismicNextLink field={prismicData.data.logo_link}>
                  <CustomSVG
                    src={prismicData.data.logo.url}
                    className="text-primary h-auto max-h-[28px] w-auto max-w-[144px] lg:max-h-[34px] lg:max-w-[172px]"
                    title={prismicData.data.logo.alt}
                  />
                </PrismicNextLink>
              </div>
            )}

            {/* Description */}
            {isFilled.richText(prismicData.data.description) && (
              <CustomRichText field={prismicData.data.description} />
            )}

            {/* Social Links */}
            {prismicData.data.social_media &&
              prismicData.data.social_media.length > 0 && (
                <ul className="text-muted-foreground flex items-center space-x-0.5">
                  {prismicData.data.social_media?.map(
                    (
                      social: FooterDocumentDataSocialMediaItem,
                      index: number
                    ) => {
                      if (!social.link || !social.icon.url) {
                        return null;
                      }

                      return (
                        <li
                          key={index}
                          className="hover:text-primary font-medium"
                        >
                          <Button asChild variant="ghost" size="icon">
                            <PrismicNextLink field={social.link}>
                              <SVG
                                src={social.icon.url}
                                className="size-5 shrink-0"
                                title={social.icon.alt}
                              />
                            </PrismicNextLink>
                          </Button>
                        </li>
                      );
                    }
                  )}
                </ul>
              )}
          </div>

          {/* Links */}
          <div className="grid w-full max-w-3xl grid-cols-2 gap-6 md:grid-cols-3 lg:gap-10">
            {prismicData.data.links?.map((link, index) => {
              if (!isFilled.contentRelationship(link.link)) {
                return null;
              }

              if (
                link.link.data?.sublinks?.length &&
                link.link.data?.sublinks?.length > 0
              ) {
                return (
                  <div key={index}>
                    <h3 className="mb-2 font-bold">
                      {link.link.data?.dropdown_label}
                    </h3>

                    <ul className="text-muted-foreground text-sm">
                      {link.link.data?.sublinks?.map((sublink, sublinkIdx) => (
                        <li
                          key={sublinkIdx}
                          className="hover:text-primary font-medium"
                        >
                          <PrismicNextLink
                            className="flex min-h-8 items-center"
                            field={sublink.link}
                          >
                            {sublink.link.text}
                          </PrismicNextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              return (
                <PrismicNextLink
                  className="hover:text-primary self-start font-bold"
                  key={index}
                  field={link.link}
                >
                  {link.link.data?.main_link?.text}
                </PrismicNextLink>
              );
            })}
          </div>
        </div>

        <div className="text-muted-foreground mt-8 flex flex-col justify-between gap-4 border-t py-8 text-sm font-medium md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">
            © {new Date().getFullYear()} {prismicData.data.copyright_text}
          </p>

          <div className="order-1 flex flex-col gap-4 md:order-2 md:flex-row md:items-center">
            <ul className="flex flex-col gap-4 md:flex-row">
              {prismicData.data.policies?.map((policy, index) => (
                <li key={index}>
                  <Button asChild variant="link" size="link">
                    <PrismicNextLink field={policy}>
                      {policy.text}
                    </PrismicNextLink>
                  </Button>
                </li>
              ))}

              {prismicData.data.manage_cookies_label && (
                <li>
                  <Button
                    className="cursor-pointer"
                    onClick={showCookieBanner}
                    variant="link"
                    size="link"
                  >
                    {prismicData.data.manage_cookies_label}
                  </Button>
                </li>
              )}
            </ul>

            <ModeToggle className="bg-foreground/2 rounded-md" />
          </div>
        </div>
      </Container>
    </footer>
  );
};

export { Footer };
