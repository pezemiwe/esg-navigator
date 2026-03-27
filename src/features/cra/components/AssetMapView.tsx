import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Box } from "@mui/material";

/* ── Fix default Leaflet marker icon (broken by bundlers) ── */
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface AssetPin {
  lat: number;
  lon: number;
  label: string;
  detail?: string;
}

function FitBounds({ pins }: { pins: AssetPin[] }) {
  const map = useMap();
  const bounds = useMemo(() => {
    if (pins.length === 0) return null;
    return L.latLngBounds(pins.map((p) => [p.lat, p.lon]));
  }, [pins]);

  if (bounds) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
  return null;
}

interface AssetMapViewProps {
  pins: AssetPin[];
  height?: number | string;
  borderRadius?: number;
  zoom?: number;
  center?: [number, number];
}

export default function AssetMapView({
  pins,
  height = 320,
  borderRadius = 12,
  center,
  zoom = 6,
}: AssetMapViewProps) {
  const defaultCenter: [number, number] =
    pins.length > 0
      ? [
          pins.reduce((s, p) => s + p.lat, 0) / pins.length,
          pins.reduce((s, p) => s + p.lon, 0) / pins.length,
        ]
      : (center ?? [9.06, 7.49]); // Default: Nigeria

  return (
    <Box
      sx={{
        height,
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.08)",
        "& .leaflet-container": { height: "100%", width: "100%" },
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((pin, idx) => (
          <Marker key={idx} position={[pin.lat, pin.lon]}>
            <Popup>
              <strong>{pin.label}</strong>
              {pin.detail && <br />}
              {pin.detail}
            </Popup>
          </Marker>
        ))}
        {pins.length > 1 && <FitBounds pins={pins} />}
      </MapContainer>
    </Box>
  );
}
