import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvent } from 'react-leaflet'
import L from 'leaflet'

// Minimal marker style
const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div class="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white shadow"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function FitBounds({ origin, destination }) {
  const map = useMap()
  React.useEffect(() => {
    if (!origin || !destination) return
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ])
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [origin, destination, map])
  return null
}

function ClickRefiner({ onRefineOrigin }) {
  useMapEvent('click', (e) => {
    if (onRefineOrigin) {
      onRefineOrigin({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

export default function SmartCityMap({ origin, destination, stores = [], onRefineOrigin }) {
  const path = useMemo(() => {
    if (!origin || !destination) return []
    return [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]
  }, [origin, destination])

  const center = origin || { lat: 37.7749, lng: -122.4194 }

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden border">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {origin && <Marker position={[origin.lat, origin.lng]} icon={markerIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={markerIcon} />}
        {path.length === 2 && (
          <Polyline
            positions={path}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }}
          />
        )}
        <FitBounds origin={origin} destination={destination} />
        <ClickRefiner onRefineOrigin={onRefineOrigin} />
      </MapContainer>
    </div>
  )
}
