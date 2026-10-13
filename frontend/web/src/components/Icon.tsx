import { ICON_STROKE_WIDTH, ICON_VIEWBOX, icons, type IconName } from '../../../src/theme';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** Ikona z makiet: obrys w kolorze tekstu (currentColor), zawsze dekoracyjna. */
export function Icon({ name, size = 18, className }: IconProps) {
  const icon = icons[name];
  const strokeWidth = 'strokeWidth' in icon ? icon.strokeWidth : ICON_STROKE_WIDTH;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icon.shapes.map((shape, i) => {
        switch (shape.kind) {
          case 'path':
            return <path key={i} d={shape.d} />;
          case 'circle':
            return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} />;
          case 'rect':
            return (
              <rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                transform={'transform' in shape ? shape.transform : undefined}
              />
            );
        }
      })}
    </svg>
  );
}
