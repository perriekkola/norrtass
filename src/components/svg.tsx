import SVG from 'react-inlinesvg';

const CustomSVG = ({
  src,
  className,
  title,
}: {
  src: string;
  className?: string;
  title?: string | null;
}) => {
  return (
    <SVG
      preProcessor={(code) => {
        // Replace all fill="..." with fill="currentColor"
        let processed = code.replace(/fill=".*?"/g, 'fill="currentColor"');
        // Replace inline style fill (e.g., style="fill:#1E1E1E;...") with fill: currentColor;
        processed = processed.replace(
          /style="[^"]*fill:[^;"]+;?[^"]*"/g,
          'style="fill:currentColor;"'
        );
        return processed;
      }}
      src={src}
      className={className}
      title={title}
    />
  );
};

export { CustomSVG };
