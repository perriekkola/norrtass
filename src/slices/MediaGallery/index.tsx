import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { cn, hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `MediaGallery`.
 */
export type MediaGalleryProps = SliceComponentProps<Content.MediaGallerySlice>;

/**
 * Component for "MediaGallery" Slices.
 */
const MediaGallery: FC<MediaGalleryProps> = ({ slice }) => {
  const {
    callout,
    title,
    description,
    media_items,
    buttons,
    tinted_background,
  } = slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);
  const mediaItems = isFilled.group(media_items) ? media_items : [];
  const itemCount = mediaItems.length;

  // Dynamic grid columns based on number of media items (max 3 columns)
  const getGridCols = () => {
    if (itemCount === 1) return 'grid-cols-1';
    if (itemCount === 2) return 'grid-cols-2';
    if (itemCount === 3) return 'grid-cols-1 md:grid-cols-3';
    if (itemCount === 4) return 'grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3';
  };

  // Dynamic aspect ratio based on number of items
  const getAspectRatio = () => {
    return itemCount === 1 ? 'aspect-[16/10]' : 'aspect-square';
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(!hasIntroContent && 'py-6 lg:py-8')}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="space-y-8 lg:space-y-16">
          {/* Section Header */}
          {hasIntroContent && (
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="center"
              buttons={buttons}
            />
          )}

          {/* Media Gallery Grid */}
          {mediaItems.length > 0 && (
            <div className={cn('grid gap-6', getGridCols())}>
              {mediaItems.map((item, index) => {
                // Check if we have video or image
                const hasVideo = isFilled.linkToMedia(item.video);
                const hasImage = isFilled.image(item.image);

                // Skip if no media
                if (!hasVideo && !hasImage) return null;

                return (
                  <div
                    key={index}
                    className={cn(
                      'bg-muted relative overflow-hidden rounded-2xl',
                      getAspectRatio()
                    )}
                  >
                    {/* Video (priority over image) */}
                    {hasVideo && 'url' in item.video && item.video.url && (
                      <video
                        className="h-full w-full object-cover"
                        preload="metadata"
                        controls={item.show_video_controls}
                        autoPlay={!item.show_video_controls}
                        muted={!item.show_video_controls}
                        playsInline={!item.show_video_controls}
                        loop={!item.show_video_controls}
                        poster={
                          hasImage && item.image.url
                            ? item.image.url
                            : undefined
                        }
                      >
                        <source
                          src={item.video.url}
                          type={(() => {
                            const extension = item.video.url
                              .split('.')
                              .pop()
                              ?.toLowerCase();
                            switch (extension) {
                              case 'mp4':
                                return 'video/mp4';
                              case 'webm':
                                return 'video/webm';
                              case 'ogg':
                                return 'video/ogg';
                              case 'mov':
                                return 'video/quicktime';
                              default:
                                return 'video/mp4';
                            }
                          })()}
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}

                    {/* Image (fallback or when no video) */}
                    {!hasVideo && hasImage && (
                      <PrismicNextImage
                        field={item.image}
                        className="h-full w-full object-cover"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default MediaGallery;
