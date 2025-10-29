import React from 'react';

import { components } from '@/slices';

import type {
  FourOhFourDocumentDataSlicesSlice,
  PageDocumentDataSlicesSlice,
} from '../../prismicio-types';

// Use the auto-generated union types from Prismic
type AllSliceTypes =
  | PageDocumentDataSlicesSlice
  | FourOhFourDocumentDataSlicesSlice;

interface CustomSliceZoneProps {
  slices: AllSliceTypes[];
  context?: Record<string, unknown>;
}

/**
 * Custom SliceZone implementation that passes index and context to each slice component
 * This replaces the standard Prismic SliceZone to provide additional props to slices
 */
// Extended props interface for slice components with additional props
export interface ExtendedSliceProps {
  slice: AllSliceTypes;
  index: number;
  context: {
    sliceIndex: number;
    [key: string]: unknown;
  };
}

export function CustomSliceZone({
  slices,
  context = {},
}: CustomSliceZoneProps) {
  return (
    <>
      {slices.map((slice, index) => {
        const Component =
          components[slice.slice_type as keyof typeof components];
        if (!Component) return null;

        // Cast Component to accept additional props while maintaining type safety
        const ComponentWithIndex =
          Component as React.ComponentType<ExtendedSliceProps>;

        return (
          <ComponentWithIndex
            key={slice.id}
            slice={slice}
            index={index}
            context={{ sliceIndex: index, ...context }}
          />
        );
      })}
    </>
  );
}
