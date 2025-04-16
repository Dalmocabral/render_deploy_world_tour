import { Marker } from "react-leaflet";
import { useEffect, useRef, forwardRef } from "react";
import L from "leaflet";
import "leaflet-rotatedmarker"; // Certifique-se de ter instalado e importado esta biblioteca

const RotatedMarker = forwardRef(({ rotationAngle = 0, rotationOrigin = "center", children, ...props }, ref) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setRotationAngle(rotationAngle);
      markerRef.current.setRotationOrigin(rotationOrigin);
    }
  }, [rotationAngle, rotationOrigin]);

  return (
    <Marker
      ref={(el) => {
        markerRef.current = el;
        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      {...props}
    >
      {children}
    </Marker>
  );
});

export default RotatedMarker;
