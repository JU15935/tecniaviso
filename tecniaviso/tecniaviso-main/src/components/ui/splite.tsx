import { forwardRef } from "react";

interface SplineSceneProps {
  scene?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Spline 3D runtime removed — was blocking React mount silently
export function SplineScene({ className, style }: SplineSceneProps) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(135deg, #060818 0%, #0d0628 50%, #0a1040 100%)",
        ...style,
      }}
    />
  );
}

const Spline = forwardRef<HTMLDivElement, SplineSceneProps>(
  ({ className, style }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        background: "linear-gradient(135deg, #060818 0%, #0d0628 50%, #0a1040 100%)",
        ...style,
      }}
    />
  )
);
Spline.displayName = "Spline";
export default Spline;
