import React from 'react'

function StoreResults({ store, selectedItems, onSelectStore, onGo }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {store.storeName}
          </h3>
          <p className="text-xs text-gray-500">
            {store.distanceMiles?.toFixed(1)} miles away
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${store.totalPrice?.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Items</p>
        <ul className="divide-y divide-gray-100 rounded-xl overflow-hidden">
          {store.items?.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between py-2 px-3 bg-white">
              <span className="text-sm text-gray-700">{item.name}</span>
              <span className="text-sm font-medium text-gray-900">${item.price?.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
        <button
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          onClick={() => onSelectStore(store)}
        >
          {selectedItems?.storeId === store.storeId ? 'Unselect' : 'Select Store'}
        </button>

        <button
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={() => onGo(store)}
        >
          Go (Open Route)
        </button>
      </div>
    </div>
  )
}

export default StoreResults
