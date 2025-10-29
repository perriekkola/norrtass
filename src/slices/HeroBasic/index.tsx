'use client';

import { FC, useRef } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { motion, useScroll, useTransform } from 'motion/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { SectionIntro } from '@/components/section-intro';
import { cn } from '@/lib/utils';

/**
 * Props for `HeroBasic`.
 */
export type HeroBasicProps = SliceComponentProps<Content.HeroBasicSlice>;

/**
 * Component for "HeroBasic" Slices.
 */
const HeroBasic: FC<HeroBasicProps> = ({ slice, index }) => {
  const addOverlay = slice.primary.add_overlay;
  const addBlur = slice.primary.add_blur;
  const useDarkTexts = slice.primary.dark_texts;
  const isFirstSlice = index === 0;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0', '200px']);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-muted py-0 lg:py-0"
    >
      <div
        ref={ref}
        className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden lg:min-h-[720px]"
      >
        {/* Background Image with Parallax */}
        {isFilled.image(slice.primary.media) && (
          <motion.div className="absolute inset-0" style={{ y }}>
            <PrismicNextImage
              sizes="100vw"
              field={slice.primary.media}
              className="-mt-[400px] h-[calc(100%+400px)] w-full object-cover"
              priority={isFirstSlice}
            />
          </motion.div>
        )}

        {addOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/40" />
        )}

        {/* Progressive Blur */}
        {addBlur && (
          <div className="absolute right-0 bottom-0 left-0 h-full">
            <ProgressiveBlur
              direction="bottom"
              blurLayers={6}
              blurIntensity={2}
              className="h-full"
            />
          </div>
        )}

        {/* Content */}
        <Container
          className={cn(
            'relative max-w-2xl',
            !useDarkTexts
              ? 'prose-headings:text-white prose-p:text-white [&_.text-link]:text-white'
              : 'prose-p:text-black prose-headings:!text-black [&_.text-link]:text-black'
          )}
        >
          <SectionIntro
            title={slice.primary.title}
            description={slice.primary.description}
            callout={slice.primary.callout}
            buttons={slice.primary.buttons}
          />
        </Container>
      </div>
    </Section>
  );
};

export default HeroBasic;
