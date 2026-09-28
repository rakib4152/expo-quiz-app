import React from 'react';

export interface SvgProps {
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  className?: string;
  style?: any;
  children?: React.ReactNode;
  testID?: string;
  [key: string]: any;
}

export const Svg = React.forwardRef<SVGSVGElement, any>(({ children, ...props }, ref) => (
  <svg ref={ref} xmlns="http://www.w3.org/2000/svg" {...props}>
    {children}
  </svg>
));
Svg.displayName = 'Svg';

export const Path = React.forwardRef<SVGPathElement, any>((props, ref) => <path ref={ref} {...props} />);
Path.displayName = 'Path';

export const Rect = React.forwardRef<SVGRectElement, any>((props, ref) => <rect ref={ref} {...props} />);
Rect.displayName = 'Rect';

export const Circle = React.forwardRef<SVGCircleElement, any>((props, ref) => <circle ref={ref} {...props} />);
Circle.displayName = 'Circle';

export const Line = React.forwardRef<SVGLineElement, any>((props, ref) => <line ref={ref} {...props} />);
Line.displayName = 'Line';

export const Polyline = React.forwardRef<SVGPolylineElement, any>((props, ref) => <polyline ref={ref} {...props} />);
Polyline.displayName = 'Polyline';

export const Polygon = React.forwardRef<SVGPolygonElement, any>((props, ref) => <polygon ref={ref} {...props} />);
Polygon.displayName = 'Polygon';

export const G = React.forwardRef<SVGGElement, any>(({ children, ...props }, ref) => (
  <g ref={ref} {...props}>
    {children}
  </g>
));
G.displayName = 'G';

export const Defs = React.forwardRef<SVGDefsElement, any>(({ children, ...props }, ref) => (
  <defs ref={ref} {...props}>
    {children}
  </defs>
));
Defs.displayName = 'Defs';

export const Stop = React.forwardRef<SVGStopElement, any>((props, ref) => <stop ref={ref} {...props} />);
Stop.displayName = 'Stop';

export const ClipPath = React.forwardRef<SVGClipPathElement, any>(({ children, ...props }, ref) => (
  <clipPath ref={ref} {...props}>
    {children}
  </clipPath>
));
ClipPath.displayName = 'ClipPath';

export default Svg;
