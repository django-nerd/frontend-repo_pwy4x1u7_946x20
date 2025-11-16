import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Search, MapPin, ShoppingCart, Compass } from 'lucide-react'
import StoreResults from './components/StoreResults'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [query, setQuery] = useState('eggs, milk, chicken breast')
  const [userLocation, setUserLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      setLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLoadingLocation(false)
      },
      (err) => {
        setError('Location access denied. Please allow location to search nearby stores.')
        setLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

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

  const hero = (
    <section className="relative min-h-[60vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/g5OaHmrKTDxRI7Ig/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <div className="backdrop-blur-md bg-black/30 rounded-2xl p-6 md:p-10 text-white">
            <div className="flex items-center gap-2 text-blue-200 text-sm font-semibold mb-2">
              <Compass size={16} /> Smart-city groceries
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              CheapStop — find the closest, cheapest basket near you
            </h1>
            <p className="mt-3 text-blue-100 max-w-2xl">
              Type your list, we scan nearby big-box stores, and you tap Go to open live directions in Google Maps.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 pointer-events-auto">
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
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow"
              >
                <ShoppingCart size={18} /> {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            <div className="mt-3 text-xs text-blue-200">
              {loadingLocation ? (
                <span className="inline-flex items-center gap-1"><MapPin size={14} /> Detecting your location…</span>
              ) : userLocation ? (
                <span className="inline-flex items-center gap-1"><MapPin size={14} /> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-200"><MapPin size={14} /> {error || 'Location unavailable'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {hero}

      <main className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {results ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500">Best Pit Stop</p>
                  <h2 className="text-xl font-bold text-gray-900">{results.stores?.[0]?.storeName || '—'}</h2>
                  {results.stores?.[0] && (
                    <p className="text-xs text-gray-500 mt-1">{results.stores[0].distanceMiles.toFixed(1)} miles away • ${results.stores[0].totalPrice.toFixed(2)} total</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Tap Go on this store to start navigation via Google Maps.</p>
                </div>
                {results.stores?.[0] && (
                  <button
                    className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    onClick={() => handleGoToStore(results.stores[0])}
                  >
                    Go (Open Route)
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {selectedStore && (
              <div className="rounded-2xl bg-white border p-4">
                <h3 className="text-lg font-semibold">Route Preview</h3>
                <p className="text-xs text-gray-500">Embedded map is optional; external Google Maps opens on Go.</p>
                <div className="mt-3">
                  <iframe
                    title="Route map"
                    className="w-full h-64 mt-2 rounded-xl border"
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY || 'AIzaSyD-PLACEHOLDER'}&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedStore.lat},${selectedStore.lng}&mode=driving`}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p className="mb-2">Search for items to see nearby store options.</p>
            <p className="text-sm text-gray-400">We do not store your location. It is used only to calculate distance and route.</p>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-xs text-gray-400">
        Built for hackathons. CheapStop makes smart-city grocery runs easy.
      </footer>
    </div>
  )
}

export default App
