import {motion, type PanInfo, useMotionValue, useTransform} from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface HorizontalSliderProps {
  value: number;
  onChange: (newValue: number) => void;
  svgIcon: React.ReactNode;
}

export function HorizontalSlider({ value, onChange, svgIcon }: HorizontalSliderProps) {

  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState<number>(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setTrackWidth(entries[0].contentRect.width);
      }
    });

    if (trackRef.current) {
      observer.observe(trackRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Motion value to track the slider's percentage (0-100)
  const x = useMotionValue(value);

  // Transform the percentage into a pixel width for the fill element
  const fillWidth = useTransform(x, [0, 100], [0, trackWidth]);

  // This function handles both clicking (onTap) and dragging (onPan)
  const handleGesture = (
      _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    if (!trackRef.current || trackWidth === 0) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    // Calculate the new percentage based on the pointer's position within the track
    const newPercentage = ((info.point.x - trackRect.left) / trackWidth) * 100;
    
    // Clamp the value between 0 and 100 to prevent it from going out of bounds
    const clampedPercentage = Math.max(0, Math.min(100, newPercentage));

    x.set(clampedPercentage);
    onChange(clampedPercentage);
  };
  
  // This effect syncs the slider's internal motion value with the `value` prop
  // from the parent component. This allows for programmatic updates.
  useEffect(() => {
    x.set(value);
  }, [value, x]);

  return (
    <motion.div
      ref={trackRef}
      className="relative w-full h-14 border border-gray-300 rounded-full overflow-hidden"
      onTap={handleGesture}
      onPan={handleGesture}
    >
      {/* The "fill" part of the slider */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-gray-300 rounded-full items-center flex ps-5"
        style={{ width: fillWidth }}>
          {svgIcon}
        </motion.div>
    </motion.div>
  );
}
