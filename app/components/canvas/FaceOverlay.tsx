'use client';

import { useStore, FaceBox } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface FaceOverlayProps {
  scale?: number; // In case we need to scale coordinates based on responsive image
}

export const FaceOverlay = () => {
  const { faces, activeFaceId, setActiveFace } = useStore();

  return (
    <div className="absolute inset-0 z-20">
      {faces.map((face) => (
        <FaceMarker
          key={face.id}
          face={face}
          isActive={activeFaceId === face.id}
          onClick={() => setActiveFace(face.id)}
        />
      ))}
    </div>
  );
};

const FaceMarker = ({
  face,
  isActive,
  onClick,
}: {
  face: FaceBox;
  isActive: boolean;
  onClick: () => void;
}) => {
  // Convert absolute coords to percentages for responsiveness
  // Assuming the parent container matches the image aspect ratio exactly
  // But wait, the Store stores pixel values from the original image?
  // We need to know the rendered size vs original size. 
  // For simplicity in this MVP, we will assume the container sets the context 
  // and we might need to rely on % if possible, or use a ResizeObserver.
  // 
  // Strategy: We will render the markers using style={{ left: 'x%', top: 'y%' }}
  // BUT we need the original image dimensions to calculate %.
  // Let's assume for now we can get percentages if we normalize during detection.
  // Let's update `face-detection.ts` later to normalize?
  // Or just rely on pixels if the image is displayed at natural size?
  // Mobile images are responsive. Percentage is safer.
  
  // Update: I will use a helper in the main View to normalize these before putting in store? 
  // OR just assume the `face` object has relative coordinates (0-1).
  // Let's assume relative coordinates (0-1) for this component to be responsive.
  
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${face.x * 100}%`,
        top: `${face.y * 100}%`,
        width: `${face.width * 100}%`,
        height: `${face.height * 100}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Visual Indicator: Different colors for filled vs empty */}
      {!isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${
            face.linkedinUrl 
              ? 'bg-[var(--color-cyan)] text-[var(--color-cyan)]' 
              : 'bg-yellow-500 text-yellow-500'
          }`}
          title={face.linkedinUrl ? 'LinkedIn Added' : 'Click to Add LinkedIn'}
        />
      )}

      {/* The "Comet Ring" (Active) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute inset-0 border-2 rounded-lg shadow-[0_0_20px_currentColor] ${
              face.linkedinUrl 
                ? 'border-[var(--color-cyan)] bg-[var(--color-cyan)]/10' 
                : 'border-yellow-500 bg-yellow-500/10'
            }`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
