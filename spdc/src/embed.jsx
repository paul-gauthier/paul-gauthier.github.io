import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

export function mountSpdc(element, props = {}) {
  const root = createRoot(element)
  root.render(<App {...props} />)
  return root
}

function autoMountSpdc() {
  document.querySelectorAll('[data-spdc-app]').forEach((element) => {
    if (element.dataset.spdcMounted === 'true') {
      return
    }

    element.dataset.spdcMounted = 'true'

    mountSpdc(element, {
      levelId: element.dataset.level || undefined,
    })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMountSpdc, { once: true })
} else {
  autoMountSpdc()
}
