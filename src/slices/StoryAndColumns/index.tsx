'use client';

import React, { FC, useMemo, useRef } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { motion, MotionValue, useScroll, useTransform } from 'motion/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Individual word component with scroll-based opacity animation
 */
const AnimatedWord: FC<{
  children: string;
  index: number;
  totalWords: number;
  scrollProgress: MotionValue<number>;
}> = ({ children, index, totalWords, scrollProgress }) => {
  const opacity = useTransform(
    scrollProgress,
    [
      Math.max(0, (index - 1) / totalWords),
      Math.min(1, (index + 1) / totalWords),
    ],
    [0.5, 1]
  );

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
};

/**
 * Scroll-animated text component that fades in words progressively
 */
const ScrollAnimatedText: FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'start 0.3'], // Start when text enters 90% of viewport, complete at 30%
  });

  const words = useMemo(() => text.split(' '), [text]);

  return (
    <div
      ref={containerRef}
      className="text-foreground text-2xl leading-[135%] font-(--bold-text) lg:text-4xl"
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <AnimatedWord
            index={index}
            totalWords={words.length}
            scrollProgress={scrollYProgress}
          >
            {word}
          </AnimatedWord>
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Props for `StoryAndColumns`.
 */
export type StoryAndColumnsProps =
  SliceComponentProps<Content.StoryAndColumnsSlice>;

/**
 * Component for "StoryAndColumns" Slices.
 */
const StoryAndColumns: FC<StoryAndColumnsProps> = ({ slice }) => {
  const { intro_text, columns, tinted_background } = slice.primary;
  const columnsData = isFilled.group(columns) ? columns : [];
  const columnCount = columnsData.length;

  // Dynamic grid columns based on number of columns
  const getGridCols = () => {
    if (columnCount === 1) return 'grid-cols-1 max-w-2xl ml-auto';
    if (columnCount === 2)
      return 'grid-cols-1 md:grid-cols-2 max-w-4xl ml-auto';
    if (columnCount === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (columnCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12">
          {/* Intro Text Section */}
          {isFilled.keyText(intro_text) && (
            <div className="max-w-2xl">
              <ScrollAnimatedText text={intro_text} />
            </div>
          )}

          {/* Columns Section */}
          {columnsData.length > 0 && (
            <div className={cn('grid gap-10 lg:gap-16', getGridCols())}>
              {columnsData.map((column, index) => (
                <div key={index} className="space-y-5">
                  {/* Column Content */}
                  {isFilled.richText(column.column_description) && (
                    <CustomRichText field={column.column_description} />
                  )}

                  {/* Column Button */}
                  {isFilled.link(column.button) && (
                    <Button asChild variant="outline">
                      <PrismicNextLink field={column.button} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default StoryAndColumns;
