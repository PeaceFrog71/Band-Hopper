// Map Modal - Popup container for the Stanton System Map

import { useState, useEffect, useCallback } from 'react';
import StantonSystemMap, { MapPosition, MapRoute } from './StantonSystemMap';

type ZoomLevel = 'system' | 'halo';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: MapPosition;
  route?: MapRoute;
  title?: string;
  initialZoom?: ZoomLevel;
}

export function MapModal({
  isOpen,
  onClose,
  position,
  route,
  title = 'Stanton System Map',
  initialZoom = 'system',
}: MapModalProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialZoom);

  // Reset zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(initialZoom);
    }
  }, [isOpen, initialZoom]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <h3>{title}</h3>
          <button
            className="map-modal-close"
            onClick={onClose}
            aria-label="Close map"
          >
            &times;
          </button>
        </div>

        <div className="map-modal-content">
          <StantonSystemMap
            position={position}
            route={route}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            showLabels={true}
          />
        </div>

        {route && (
          <div className="map-modal-footer">
            <p className="map-hint">
              <span className="green">Green</span> = Start &bull;{' '}
              <span className="gold">Gold</span> = Destination
              {route.bandExitDistance && (
                <> &bull; <span className="red">Red</span> = Exit point</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapModal;
