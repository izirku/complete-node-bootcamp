import { mapboxToken } from './tokens'

export const displayMap = locations => {
  mapboxgl.accessToken = mapboxToken

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/izirku/ck0ljpril2vf01cr1h0h0yg1l',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 6,
    // interactive: false
  })

  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach(loc => {
    // create a marker
    const el = document.createElement('div')
    el.className = 'marker'

    // add that marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map)

    // add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map)
    // extend the map bounds to include the current location
    bounds.extend(loc.coordinates)
  })

  // fit the map to created bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  })
}
