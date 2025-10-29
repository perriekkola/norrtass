'use client';

import React, { FC, useRef, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import {
  motion,
  SpringOptions,
  useInView,
  useSpring,
  useTransform,
} from 'motion/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { SectionIntro } from '@/components/section-intro';
import { Card } from '@/components/ui/card';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `HeadlineStats`.
 */
export type HeadlineStatsProps =
  SliceComponentProps<Content.HeadlineStatsSlice>;

/**
 * Utility function to parse stat values and extract numbers for animation
 * Handles formats like: "2,400%", "$410K", "11,000", "100 000 kr", "99,9%"
 */
const parseStatValue = (value: string) => {
  if (!value) return { number: 0, prefix: '', suffix: '', separator: ',' };

  // Extract prefix (non-numeric characters at the start)
  const prefixMatch = value.match(/^([^\d,.-\s]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';

  // Extract suffix (non-numeric characters at the end)
  const suffixMatch = value.match(/([^\d,.-\s]*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : '';

  // Extract the numeric part
  const numericPart = value
    .slice(prefix.length, value.length - suffix.length)
    .trim();

  // Detect separator type and decimal format
  let separator = ',';
  let isDecimalComma = false;

  if (numericPart.includes(' ') && !numericPart.includes(',')) {
    separator = ' ';
  } else if (numericPart.includes(',')) {
    // Check if comma is used as decimal separator (European format)
    // Pattern: digits,digits (e.g., "99,9" vs "2,400")
    const commaPattern = /^\d+,\d+$/;
    const thousandsPattern = /^\d{1,3}(,\d{3})*$/;

    if (commaPattern.test(numericPart) && !thousandsPattern.test(numericPart)) {
      isDecimalComma = true;
    }
  }

  // Parse the number - handle different formats
  let number = 0;
  if (numericPart) {
    let cleanNumber = numericPart.replace(/\s/g, '');

    // Handle decimal comma format (e.g., "99,9" -> "99.9")
    if (isDecimalComma) {
      cleanNumber = cleanNumber.replace(',', '.');
    } else {
      // Remove thousands separators
      cleanNumber = cleanNumber.replace(/,/g, '');
    }

    // Handle K, M, B suffixes in the numeric part
    if (cleanNumber.includes('K') || cleanNumber.includes('k')) {
      const baseNumber = parseFloat(cleanNumber.replace(/[Kk]/g, ''));
      number = baseNumber * 1000;
    } else if (cleanNumber.includes('M') || cleanNumber.includes('m')) {
      const baseNumber = parseFloat(cleanNumber.replace(/[Mm]/g, ''));
      number = baseNumber * 1000000;
    } else if (cleanNumber.includes('B') || cleanNumber.includes('b')) {
      const baseNumber = parseFloat(cleanNumber.replace(/[Bb]/g, ''));
      number = baseNumber * 1000000000;
    } else {
      number = parseFloat(cleanNumber);
    }
  }

  return {
    number: isNaN(number) ? 0 : number,
    prefix,
    suffix,
    separator: isDecimalComma ? '.' : separator,
  };
};

/**
 * Custom AnimatedNumber component that preserves original formatting
 */
const CustomAnimatedNumber: FC<{
  value: number;
  separator: string;
  springOptions?: SpringOptions;
}> = ({ value, separator, springOptions }) => {
  const spring = useSpring(0, springOptions);
  const display = useTransform(spring, (current) => {
    // Check if the original value has decimal places
    const hasDecimals = value % 1 !== 0;

    if (hasDecimals) {
      // Preserve decimal places during animation
      const formatted = current.toFixed(1);
      // Format number with the detected separator
      if (separator === ' ') {
        return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      } else {
        return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    } else {
      // For whole numbers, round normally
      const rounded = Math.round(current);
      // Format number with the detected separator
      if (separator === ' ') {
        return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      } else {
        return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }
  });

  // Trigger animation when value changes
  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className="tabular-nums">{display}</motion.span>;
};

/**
 * AnimatedStatValue component that handles the animated number with in-view trigger
 */
const AnimatedStatValue: FC<{ value: string }> = ({ value }) => {
  const { number, prefix, suffix, separator } = parseStatValue(value);
  const [animatedValue, setAnimatedValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  if (isInView && animatedValue === 0 && number > 0) {
    setAnimatedValue(number);
  }

  return (
    <div ref={ref} className="inline-flex items-baseline whitespace-nowrap">
      {prefix && <span>{prefix}</span>}
      <CustomAnimatedNumber
        value={animatedValue}
        separator={separator}
        springOptions={{
          bounce: 0,
          duration: 2000,
        }}
      />
      {suffix && <span>{suffix}</span>}
    </div>
  );
};

/**
 * Component for "HeadlineStats" Slices.
 */
const HeadlineStats: FC<HeadlineStatsProps> = ({ slice }) => {
  const { callout, title, description, stats, tinted_background } =
    slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);
  const statsData = isFilled.group(stats) ? stats : [];

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12">
          {/* Section Intro */}
          {hasIntroContent && (
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="left"
              className="max-w-3xl"
            />
          )}

          {/* Stats Grid */}
          {statsData.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {statsData.map((stat, index) => (
                <Card key={index} className="h-full px-6">
                  <Spotlight
                    className="from-foreground/5 bg-radial to-transparent"
                    size={300}
                  />

                  {/* Stat Label */}
                  {stat.stat_label && (
                    <h3 className="text-primary text-base font-(--bold-text)">
                      {stat.stat_label}
                    </h3>
                  )}

                  {/* Stat Value with Animated SlidingNumber */}
                  <div className="text-3xl font-(--bold-text) lg:text-4xl">
                    <AnimatedStatValue value={stat.stat_value || ''} />
                  </div>

                  {/* Stat Description */}
                  {isFilled.richText(stat.stat_description) && (
                    <CustomRichText
                      field={stat.stat_description}
                      className="text-muted-foreground text-sm leading-relaxed"
                    />
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default HeadlineStats;
