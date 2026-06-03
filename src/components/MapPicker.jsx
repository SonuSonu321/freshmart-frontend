import React from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

function LocationMarker({ coords, onSelect }) {
  useMapEvents({
    click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }) }
  })
  return coords ? <Marker position={[coords.lat, coords.lng]} /> : null
}

export default function MapPicker({ coords, onSelect }) {
  return (
    <div className="h-48 rounded-xl overflow-hidden border dark:border-gray-600">
      <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker coords={coords} onSelect={onSelect} />
      </MapContainer>
    </div>
  )
}
