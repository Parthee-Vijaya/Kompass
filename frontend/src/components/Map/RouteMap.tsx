import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Route, Assignment } from '@/services/api'

interface RouteMapProps {
  routes: Route[]
  selectedEmployeeId?: string | null
  onEmployeeSelect?: (employeeId: string) => void
  onAssignmentSelect?: (assignment: Assignment) => void
  className?: string
}

const EMPLOYEE_COLORS = [
  '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
]

function createEmployeeIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 32 : 24
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid ${isSelected ? '#1f2937' : 'white'};box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="5"/>
        <path d="M20 21a8 8 0 1 0-16 0"/>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createTaskIcon(color: string, order: number, isSelected: boolean) {
  const size = isSelected ? 32 : 26
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:6px;border:2px solid ${isSelected ? '#1f2937' : 'white'};box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${size * 0.45}px">${order + 1}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function RouteMap({
  routes,
  selectedEmployeeId,
  onEmployeeSelect,
  onAssignmentSelect,
  className = '',
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const polylinesRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([55.6761, 11.0886], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    polylinesRef.current = L.layerGroup().addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !polylinesRef.current) return

    markersRef.current.clearLayers()
    polylinesRef.current.clearLayers()

    const bounds: L.LatLngBoundsExpression = []

    routes.forEach((route, routeIndex) => {
      const color = EMPLOYEE_COLORS[routeIndex % EMPLOYEE_COLORS.length] ?? '#6b7280'
      const isSelected = selectedEmployeeId === route.employeeId

      if (route.employee?.homeLatitude && route.employee?.homeLongitude) {
        const homePos: L.LatLngExpression = [
          route.employee.homeLatitude,
          route.employee.homeLongitude,
        ]
        bounds.push(homePos)

        const homeMarker = L.marker(homePos, {
          icon: createEmployeeIcon(color, isSelected),
          zIndexOffset: isSelected ? 1000 : 0,
        })

        homeMarker.bindPopup(`
          <div style="min-width:150px">
            <strong>${route.employee.name}</strong><br/>
            <span style="color:#6b7280;font-size:12px">Hjemmeadresse</span><br/>
            <span style="font-size:12px">${route.assignments.length} opgaver</span>
          </div>
        `)

        homeMarker.on('click', () => {
          onEmployeeSelect?.(route.employeeId)
        })

        markersRef.current?.addLayer(homeMarker)
      }

      const routeCoords: L.LatLngExpression[] = []

      if (route.employee?.homeLatitude && route.employee?.homeLongitude) {
        routeCoords.push([route.employee.homeLatitude, route.employee.homeLongitude])
      }

      route.assignments
        .sort((a, b) => a.routeOrder - b.routeOrder)
        .forEach((assignment, order) => {
          const client = assignment.task?.client
          if (!client?.latitude || !client?.longitude) return

          const pos: L.LatLngExpression = [client.latitude, client.longitude]
          bounds.push(pos)
          routeCoords.push(pos)

          const marker = L.marker(pos, {
            icon: createTaskIcon(color, order, isSelected),
            zIndexOffset: isSelected ? 500 : 0,
          })

          const startTime = new Date(assignment.startTime).toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const endTime = new Date(assignment.endTime).toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
          })

          marker.bindPopup(`
            <div style="min-width:180px">
              <strong>${assignment.task?.title || 'Opgave'}</strong><br/>
              <span style="color:#6b7280;font-size:12px">${client.name}</span><br/>
              <span style="font-size:12px">${client.address}</span><br/>
              <hr style="margin:8px 0;border-color:#e5e7eb"/>
              <span style="font-size:12px">🕐 ${startTime} - ${endTime}</span><br/>
              <span style="font-size:12px">⏱️ ${assignment.task?.durationMinutes || 30} min</span>
              ${assignment.travelMinutes ? `<br/><span style="font-size:12px">🚗 ${assignment.travelMinutes} min rejsetid</span>` : ''}
            </div>
          `)

          marker.on('click', () => {
            onAssignmentSelect?.(assignment)
            onEmployeeSelect?.(route.employeeId)
          })

          markersRef.current?.addLayer(marker)
        })

      if (routeCoords.length > 1) {
        const polyline = L.polyline(routeCoords, {
          color,
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 0.9 : 0.6,
          dashArray: isSelected ? undefined : '5, 10',
        })

        polylinesRef.current?.addLayer(polyline)
      }
    })

    if (bounds.length > 0 && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.fitBounds(bounds as L.LatLngBoundsExpression, {
          padding: [50, 50],
          maxZoom: 14,
        })
      } catch {
        // Bounds may be invalid if all points are the same
      }
    }
  }, [routes, selectedEmployeeId, onEmployeeSelect, onAssignmentSelect])

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[400px] rounded-lg ${className}`}
      style={{ background: '#f3f4f6' }}
    />
  )
}
