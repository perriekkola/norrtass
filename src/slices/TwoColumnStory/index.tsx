'use client';

import React, { FC, useMemo, useRef } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import { motion, MotionValue, useScroll, useTransform } from 'motion/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
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
 * Props for `TwoColumnStory`.
 */
export type TwoColumnStoryProps =
  SliceComponentProps<Content.TwoColumnStorySlice>;

/**
 * Component for "TwoColumnStory" Slices.
 */
const TwoColumnStory: FC<TwoColumnStoryProps> = ({ slice }) => {
  const { intro_text, content, reverse_columns, tinted_background } =
    slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div
          className={cn(
            'mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-24',
            reverse_columns && 'lg:grid-flow-col-dense'
          )}
        >
          {/* Intro Text Column */}
          <div
            className={cn('flex flex-col', reverse_columns && 'lg:col-start-2')}
          >
            {isFilled.keyText(intro_text) && (
              <div className="space-y-6">
                <ScrollAnimatedText text={intro_text} />
              </div>
            )}
          </div>

          {/* Content Column */}
          <div
            className={cn(
              'flex flex-col pt-1',
              reverse_columns && 'lg:col-start-1'
            )}
          >
            {isFilled.richText(content) && <CustomRichText field={content} />}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default TwoColumnStory;
