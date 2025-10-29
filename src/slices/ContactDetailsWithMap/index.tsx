import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { Mail, MapPin, Phone } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';

/**
 * Props for `ContactDetailsWithMap`.
 */
export type ContactDetailsWithMapProps =
  SliceComponentProps<Content.ContactDetailsWithMapSlice>;

/**
 * Component for "ContactDetailsWithMap" Slices.
 */
const ContactDetailsWithMap: FC<ContactDetailsWithMapProps> = ({ slice }) => {
  const {
    map_url,
    callout,
    title,
    description,
    buttons,
    contact_details,
    tinted_background,
  } = slice.primary;

  // Icon mapping for contact types
  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="size-5" />;
      case 'email':
        return <Mail className="size-5" />;
      case 'address':
        return <MapPin className="size-5" />;
      default:
        return <MapPin className="size-5" />;
    }
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-20">
          {/* Map Section */}
          {isFilled.keyText(map_url) && (
            <div className="bg-muted relative order-1 aspect-[12/10] overflow-hidden rounded-2xl lg:order-0 lg:h-full">
              <iframe
                src={map_url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
                title="Location Map"
              />
            </div>
          )}

          {/* Content Section */}
          <div className="order-0 flex flex-col justify-center lg:order-2">
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="left"
              className="mb-8"
            />

            {/* Contact Details */}
            {isFilled.group(contact_details) && (
              <div className="mb-6 flex flex-col items-start gap-3">
                {contact_details.map((item, index) => {
                  if (
                    !isFilled.keyText(item.value) ||
                    !isFilled.select(item.type)
                  ) {
                    return null;
                  }

                  const ContactContent = () => (
                    <div className="flex items-center gap-4 font-medium">
                      {getContactIcon(item.type || 'address')}
                      <div className="flex-1">
                        <p className="text-foreground font-medium">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );

                  // Only create a link if the user has provided one
                  if (isFilled.link(item.text_link)) {
                    return (
                      <PrismicNextLink key={index} field={item.text_link}>
                        <ContactContent />
                      </PrismicNextLink>
                    );
                  }

                  // Otherwise, just display the contact info without a link
                  return (
                    <div key={index}>
                      <ContactContent />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Buttons */}
            {buttons && buttons.length > 0 && (
              <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row md:mt-4 md:gap-4">
                {buttons.map((button, index) => {
                  if (!isFilled.link(button)) return null;

                  return (
                    <Button
                      key={index}
                      variant={button.variant}
                      size="lg"
                      asChild
                    >
                      <PrismicNextLink field={button} />
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ContactDetailsWithMap;
