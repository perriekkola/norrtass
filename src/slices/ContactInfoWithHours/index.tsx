import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';

/**
 * Props for `ContactInfoWithHours`.
 */
export type ContactInfoWithHoursProps =
  SliceComponentProps<Content.ContactInfoWithHoursSlice>;

/**
 * Component for "ContactInfoWithHours" Slices.
 */
const ContactInfoWithHours: FC<ContactInfoWithHoursProps> = ({ slice }) => {
  const {
    callout,
    heading,
    description,
    contact_details,
    buttons,
    hours_heading,
    hours_subheading,
    hours_rows,
    hours_footer,
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
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:gap-16">
          {/* Content Section - Left Side */}
          <div className="flex w-full flex-col justify-center">
            <SectionIntro
              callout={callout}
              title={heading}
              description={description}
              align="left"
              className="mb-6 lg:mb-8"
            />

            {/* Contact Details */}
            {isFilled.group(contact_details) && (
              <div className="mb-6 flex flex-col items-start gap-3">
                {contact_details.map((item, index) => {
                  if (
                    !isFilled.keyText(item.contact_value) ||
                    !isFilled.select(item.contact_type)
                  ) {
                    return null;
                  }

                  const ContactContent = () => (
                    <div className="flex items-center gap-4 font-medium">
                      {getContactIcon(item.contact_type || 'address')}
                      <span className="text-foreground">
                        {item.contact_value}
                      </span>
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

          {/* Hours Section - Right Side */}
          <div className="bg-accent flex w-full items-center justify-center rounded-(--card-radius) p-8 lg:aspect-[11/10] lg:p-12">
            <div className="w-full space-y-6 text-center lg:max-w-md">
              {/* Hours Icon */}
              <div className="bg-primary mx-auto flex h-10 w-10 items-center justify-center rounded-lg">
                <Clock className="text-primary-foreground h-5 w-5" />
              </div>

              {/* Hours Content */}
              <div className="space-y-8 lg:space-y-10">
                {/* Hours Header */}
                <div>
                  {isFilled.richText(hours_heading) && (
                    <CustomRichText
                      field={hours_heading}
                      className="text-foreground text-2xl font-(--bold-text) lg:text-3xl"
                    />
                  )}
                  {isFilled.richText(hours_subheading) && (
                    <CustomRichText
                      field={hours_subheading}
                      className="text-muted-foreground -mt-1.5"
                    />
                  )}
                </div>

                {/* Hours Table */}
                {isFilled.group(hours_rows) && hours_rows.length > 0 && (
                  <div>
                    {hours_rows.map((row, index) => {
                      if (
                        !isFilled.keyText(row.days) ||
                        !isFilled.keyText(row.hours)
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={index}
                          className="border-foreground/20 flex items-center justify-between border-b py-2.5"
                        >
                          <span className="text-muted-foreground text-sm">
                            {row.days}
                          </span>
                          <span className="text-foreground text-sm font-(--bold-text)">
                            {row.hours}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Hours Footer */}
                {isFilled.richText(hours_footer) && (
                  <CustomRichText
                    field={hours_footer}
                    className="text-muted-foreground text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ContactInfoWithHours;
