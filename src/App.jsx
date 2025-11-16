import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, MapPin, ShoppingCart, Compass, Target, Sparkles } from 'lucide-react'
import StoreResults from './components/StoreResults'
import SmartCityShell from './components/SmartCityShell'
import AccuracyToggle from './components/AccuracyToggle'
import SmartCityMap from './components/SmartCityMap'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [query, setQuery] = useState('eggs, milk, chicken breast')
  const [userLocation, setUserLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [accuracy, setAccuracy] = useState('high')

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      setLoadingLocation(false)
      return
    }

    const optionsMap = {
      high: { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      balanced: { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      low: { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        // Snap to road precision by trimming decimals to ~5 places (~1.1m) but allow manual refine on the map
        const precise = { lat: Number(latitude.toFixed(6)), lng: Number(longitude.toFixed(6)) }
        setUserLocation(precise)
        setLoadingLocation(false)
      },
      (err) => {
        setError('Location access denied. Please allow location to search nearby stores.')
        setLoadingLocation(false)
      },
      optionsMap[accuracy] || optionsMap.high
    )
  }, [accuracy])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const handleSearch = useCallback(async () => {
    if (!userLocation) return
    setSearching(true)
    setError('')
    setSelectedStore(null)

    try {
      const res = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, lat: userLocation.lat, lng: userLocation.lng, radiusMiles: 10 })
      })
      if (!res.ok) throw new Error('Failed to search')
      const data = await res.json()
      setResults(data)
    } catch (e) {
      setError(e.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }, [query, userLocation])

  const handleSelectStore = useCallback((store) => {
    setSelectedStore((prev) => (prev && prev.storeId === store.storeId ? null : store))
  }, [])

  const handleGoToStore = useCallback(
    (store) => {
      if (!userLocation) return
      const origin = `${userLocation.lat},${userLocation.lng}`
      const destination = `${store.lat},${store.lng}`
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
      window.open(url, '_blank', 'noopener')
    },
    [userLocation]
  )

  const refinedCoordsText = userLocation
    ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
    : '—'

  return (
    <SmartCityShell>
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 pt-10">
          <div className="grid md:grid-cols-[1.2fr_.8fr] gap-6 items-stretch">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sky-200 text-sm font-semibold inline-flex items-center gap-2">
                  <Compass size={16}/> Smart-city groceries
                </div>
                <AccuracyToggle value={accuracy} onChange={setAccuracy} />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold mt-2 tracking-tight">Find the closest, cheapest basket</h1>
              <p className="text-sky-200/80 mt-2">Your list → nearby prices → tap Go. You can refine your origin by clicking on the mini map for pinpoint accuracy.</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow border border-white/10">
                  <Search className="text-gray-500" size={18} />
                  <input
                    className="w-full outline-none py-2 text-gray-800 placeholder:text-gray-400"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="eggs, milk, chicken breast"
                  />
                </div>
                <button
                  disabled={!userLocation || searching}
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow"
                >
                  <ShoppingCart size={18} /> {searching ? 'Searching…' : 'Search'}
                </button>
              </div>

              <div className="mt-3 text-xs text-sky-200 inline-flex items-center gap-2">
                <MapPin size={14} /> {loadingLocation ? 'Detecting your location…' : refinedCoordsText}
                <button onClick={requestLocation} className="text-sky-300 underline underline-offset-2">refresh</button>
              </div>

              <div className="mt-4">
                <SmartCityMap
                  origin={userLocation}
                  destination={selectedStore ? { lat: selectedStore.lat, lng: selectedStore.lng } : null}
                  onRefineOrigin={(c) => setUserLocation(c)}
                />
                <p className="text-[11px] text-sky-200/70 mt-2">Tip: click on the map to refine your starting point if GPS is off by a bit.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 border shadow-sm">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {results ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-sky-50 border border-sky-200 p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] text-sky-700">Best Pit Stop</p>
                        <h2 className="text-lg font-bold text-sky-900">{results.stores?.[0]?.storeName || '—'}</h2>
                        {results.stores?.[0] && (
                          <p className="text-[11px] text-sky-700 mt-1">{results.stores[0].distanceMiles.toFixed(1)} miles • ${results.stores[0].totalPrice.toFixed(2)}</p>
                        )}
                      </div>
                      {results.stores?.[0] && (
                        <button
                          className="h-9 px-3 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
                          onClick={() => handleGoToStore(results.stores[0])}
                        >
                          Go
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {results.stores?.map((store) => (
                      <StoreResults
                        key={store.storeId}
                        store={store}
                        selectedItems={selectedStore || {}}
                        onSelectStore={handleSelectStore}
                        onGo={handleGoToStore}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p className="mb-2">Search for items to see nearby store options.</p>
                  <p className="text-sm text-gray-400">We do not store your location. It is used only to calculate distance and route.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SmartCityShell>
  )
}

export default App
