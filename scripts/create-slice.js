#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const template = {
  fields: {
    primary: {
      callout: {
        type: 'StructuredText',
        config: {
          label: 'Callout',
          placeholder: '',
          allowTargetBlank: true,
          single: 'paragraph,strong,em,hyperlink',
        },
      },
      title: {
        type: 'StructuredText',
        config: {
          label: 'Title',
          placeholder: '',
          allowTargetBlank: true,
          multi: 'heading1,heading2,heading3',
        },
      },
      description: {
        type: 'StructuredText',
        config: {
          label: 'Description',
          placeholder: '',
          allowTargetBlank: true,
          multi: 'paragraph,strong,em,hyperlink,list-item,o-list-item',
        },
      },
      buttons: {
        type: 'Link',
        config: {
          label: 'Buttons',
          placeholder: '',
          select: null,
          allowTargetBlank: true,
          allowText: true,
          repeat: true,
          variants: ['default', 'secondary', 'outline', 'ghost'],
        },
      },
      tinted_background: {
        type: 'Boolean',
        config: {
          label: 'Tinted Background',
          placeholder_false: 'false',
          placeholder_true: 'true',
          default_value: false,
        },
      },
    },
  },
  component: `import { FC } from 'react';
import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for \`{{sliceName}}\`.
 */
export type {{sliceName}}Props = SliceComponentProps<Content.{{sliceName}}Slice>;

/**
 * Component for "{{sliceName}}" Slices.
 */
const {{sliceName}}: FC<{{sliceName}}Props> = ({ slice }) => {
  const { callout, title, description, buttons, tinted_background } =
    slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        {/* Intro */}
        {hasIntroContent && (
          <SectionIntro
            callout={callout}
            title={title}
            description={description}
            buttons={buttons}
            align="center"
            className="relative z-10 mb-10 lg:mb-16"
          />
        )}

        <div>
          {/* Add your custom content here */}
          <p>Custom content for {{sliceName}} slice goes here.</p>
        </div>
      </Container>
    </Section>
  );
};

export default {{sliceName}};`,
  mocks: [
    {
      __TYPE__: 'SharedSliceContent',
      variation: 'default',
      primary: {
        callout: {
          __TYPE__: 'StructuredTextContent',
          value: [
            {
              type: 'paragraph',
              content: {
                text: 'Sample callout text for the slice.',
              },
            },
          ],
        },
        title: {
          __TYPE__: 'StructuredTextContent',
          value: [
            {
              type: 'heading1',
              content: {
                text: 'Sample Title',
              },
            },
          ],
        },
        description: {
          __TYPE__: 'StructuredTextContent',
          value: [
            {
              type: 'paragraph',
              content: {
                text: 'Sample description text for the slice.',
              },
            },
          ],
        },
        buttons: {
          __TYPE__: 'RepeatableContent',
          type: 'Link',
          value: [
            {
              key: 'sample-button-key',
              __TYPE__: 'LinkContent',
              value: {
                __TYPE__: 'ExternalLink',
                url: 'https://example.com',
                text: 'Sample Button',
                variant: 'default',
              },
            },
          ],
        },
        tinted_background: {
          __TYPE__: 'BooleanContent',
          value: false,
        },
      },
      items: [],
    },
  ],
};

function toPascalCase(str) {
  return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toSnakeCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function updateSlicesIndex(snakeName, pascalName) {
  const indexPath = path.join('./src/slices', 'index.ts');

  try {
    // Read the current index.ts file
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    // Find the components object
    const componentsMatch = indexContent.match(
      /export const components = \{([\s\S]*?)\};/
    );
    if (!componentsMatch) {
      console.warn(
        '⚠️  Could not find components object in src/slices/index.ts'
      );
      return;
    }

    const componentsContent = componentsMatch[1];
    const newEntry = `  ${snakeName}: dynamic(() => import('./${pascalName}')),`;

    // Check if the entry already exists
    if (componentsContent.includes(`${snakeName}:`)) {
      console.log(`ℹ️  Entry for "${snakeName}" already exists in index.ts`);
      return;
    }

    // Add the new entry in alphabetical order
    const lines = componentsContent.split('\n').filter((line) => line.trim());
    lines.push(newEntry);

    // Sort alphabetically by the key name
    lines.sort((a, b) => {
      const keyA = a.trim().split(':')[0].trim();
      const keyB = b.trim().split(':')[0].trim();
      return keyA.localeCompare(keyB);
    });

    // Reconstruct the components object
    const newComponentsContent = '\n' + lines.join('\n') + '\n';
    const newIndexContent = indexContent.replace(
      /export const components = \{[\s\S]*?\};/,
      `export const components = {${newComponentsContent}};`
    );

    // Write the updated content
    fs.writeFileSync(indexPath, newIndexContent);
    console.log(`✅ Added "${snakeName}" to src/slices/index.ts`);
  } catch (error) {
    console.warn(`⚠️  Could not update src/slices/index.ts: ${error.message}`);
  }
}

function createSlice(sliceName) {
  const pascalName = toPascalCase(sliceName);
  const snakeName = toSnakeCase(sliceName);
  const sliceDir = path.join('./src/slices', pascalName);

  try {
    // Create slice directory
    if (!fs.existsSync(sliceDir)) {
      fs.mkdirSync(sliceDir, { recursive: true });
    }

    // Create model.json with variations structure
    const model = {
      id: snakeName,
      type: 'SharedSlice',
      name: pascalName,
      description: pascalName,
      variations: [
        {
          id: 'default',
          name: 'Default',
          docURL: '...',
          version: 'initial',
          description: 'Default',
          imageUrl: '',
          primary: template.fields.primary || {},
          items: template.fields.items || {},
        },
      ],
    };

    fs.writeFileSync(
      path.join(sliceDir, 'model.json'),
      JSON.stringify(model, null, 2)
    );

    // Create index.tsx
    const componentCode = template.component.replace(
      /{{sliceName}}/g,
      pascalName
    );
    fs.writeFileSync(path.join(sliceDir, 'index.tsx'), componentCode);

    // Create mocks.json
    fs.writeFileSync(
      path.join(sliceDir, 'mocks.json'),
      JSON.stringify(template.mocks, null, 2)
    );

    // Update src/slices/index.ts
    updateSlicesIndex(snakeName, pascalName);

    console.log(`✅ Slice "${pascalName}" created successfully!`);
    console.log(`📁 Location: ./src/slices/${pascalName}/`);
    console.log(`🔧 Next steps:`);
    console.log(`   1. Start dev server: pnpm dev`);
    console.log(`   2. Open Slice Machine UI and make a change to the slice`);
    console.log(
      `   3. Slice Machine will automatically update index.ts and types`
    );
  } catch (error) {
    console.error('Error creating slice:', error.message);
    process.exit(1);
  }
}

// CLI usage
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log('Usage: node scripts/create-slice.js <slice-name>');
  console.log('Example: node scripts/create-slice.js MyHero');
  process.exit(1);
}

const [sliceName] = args;
createSlice(sliceName);
