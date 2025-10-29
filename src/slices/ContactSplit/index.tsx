'use client';

import { FC, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { Check, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Props for `ContactSplit`.
 */
export type ContactSplitProps = SliceComponentProps<Content.ContactSplitSlice>;

/**
 * Component for "ContactSplit" Slices.
 */
const ContactSplit: FC<ContactSplitProps> = ({ slice }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    callout,
    title,
    description,
    buttons,
    contact_details,
    form_fields,
    form_disclaimer,
    submit_label,
    tinted_background,
  } = slice.primary;

  // Create dynamic form schema based on form_fields
  const formFieldsData = isFilled.group(form_fields) ? form_fields : [];

  // Build dynamic Zod schema
  const schemaFields: Record<string, z.ZodTypeAny> = {};
  const defaultValues: Record<string, string | boolean> = {};

  formFieldsData.forEach((field, index) => {
    if (isFilled.keyText(field.label)) {
      const fieldKey = `field-${index}`;
      const inputType = field.input_type || 'text';
      const isRequired = field.required;

      defaultValues[fieldKey] = '';

      if (inputType === 'email') {
        schemaFields[fieldKey] = isRequired
          ? z.string().email().min(1)
          : z.string().email().optional().or(z.literal(''));
      } else {
        schemaFields[fieldKey] = isRequired
          ? z.string().min(1)
          : z.string().optional();
      }
    }
  });

  // Add disclaimer field if it exists
  if (isFilled.richText(form_disclaimer)) {
    defaultValues.disclaimer = false;
    schemaFields.disclaimer = z.boolean().refine((val) => val === true);
  }

  const formSchema = z.object(schemaFields);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: data,
          formFields: formFieldsData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      form.reset();

      // Reset submitted state after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:gap-20">
          {/* Content Section - Left Side */}
          <div className="flex w-full flex-col justify-center">
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="left"
              className="mb-6 lg:mb-8"
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
                      <span className="text-foreground">{item.value}</span>
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

          {/* Form Section - Right Side */}
          <div className="bg-accent flex w-full items-center justify-center rounded-(--card-radius) p-6 lg:aspect-[11/10] lg:p-16">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 lg:max-w-lg"
              >
                {/* Dynamic Form Fields */}
                {formFieldsData.map((field, index) => {
                  if (!isFilled.keyText(field.label)) {
                    return null;
                  }

                  const fieldKey = `field-${index}`;
                  const inputType = field.input_type || 'text';
                  const isTextarea = field.field_type === 'textarea';
                  const isRequired = field.required;
                  const placeholder = field.placeholder || '';

                  return (
                    <FormField
                      key={index}
                      control={form.control}
                      name={fieldKey}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>
                            {field.label}
                            {isRequired && (
                              <span className="text-destructive">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            {isTextarea ? (
                              <Textarea
                                placeholder={placeholder}
                                rows={4}
                                value={(formField.value as string) || ''}
                                onChange={formField.onChange}
                                onBlur={formField.onBlur}
                                name={formField.name}
                                ref={formField.ref}
                                className="bg-background"
                              />
                            ) : (
                              <Input
                                type={inputType}
                                placeholder={placeholder}
                                value={(formField.value as string) || ''}
                                onChange={formField.onChange}
                                onBlur={formField.onBlur}
                                name={formField.name}
                                ref={formField.ref}
                                className="bg-background"
                              />
                            )}
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  );
                })}

                {/* Form Disclaimer */}
                {isFilled.richText(form_disclaimer) && (
                  <FormField
                    control={form.control}
                    name="disclaimer"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-2">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                              id="terms"
                              className="bg-background"
                            />
                          </FormControl>
                          <Label htmlFor="terms">
                            <CustomRichText
                              className="text-sm"
                              field={form_disclaimer}
                            />
                          </Label>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || isSubmitted}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isSubmitted ? (
                    <Check className="size-4" />
                  ) : isFilled.keyText(submit_label) ? (
                    submit_label
                  ) : (
                    'Send message'
                  )}
                </Button>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-destructive/10 text-destructive rounded-md p-4 text-sm">
                    <p>{errorMessage}</p>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ContactSplit;
