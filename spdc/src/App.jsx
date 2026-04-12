import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { LEVELS, buildInitialOpticYaws } from './levels'
import { OpticalScene } from './scene'

const DEFAULT_LEVEL_ID = 'level2'
const CONTROL_HEIGHT = 32
const TOP_CONTROL_BAR_HEIGHT = CONTROL_HEIGHT + 24
const POWER_METER_BAR_HEIGHT = 56
const EMBED_ASPECT_RATIO = 2

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function getFullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

function canUseNativeFullscreen(element) {
  return Boolean(element?.requestFullscreen || element?.webkitRequestFullscreen)
}

function isNativeFullscreenSupported() {
  if (typeof document === 'undefined') {
    return false
  }

  return Boolean(
    document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.documentElement?.requestFullscreen ||
      document.documentElement?.webkitRequestFullscreen,
  )
}

async function requestNativeFullscreen(element) {
  if (element.requestFullscreen) {
    await element.requestFullscreen()
    return true
  }

  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
    return true
  }

  return false
}

async function exitNativeFullscreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return true
  }

  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
    return true
  }

  return false
}

const baseControlStyle = {
  height: CONTROL_HEIGHT,
  boxSizing: 'border-box',
  padding: '0 14px',
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 13,
  lineHeight: 1,
  color: '#111827',
  colorScheme: 'light',
  WebkitTextFillColor: '#111827',
  display: 'flex',
  alignItems: 'center',
}

export default function App({ levelId = DEFAULT_LEVEL_ID }) {
  const level = LEVELS[levelId] ?? LEVELS[DEFAULT_LEVEL_ID]
  const [is2D, setIs2D] = useState(false)
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false)
  const [isExpandedFallback, setIsExpandedFallback] = useState(false)
  const [hasUserInteracted3D, setHasUserInteracted3D] = useState(false)
  const [opticYaws, setOpticYaws] = useState(() => buildInitialOpticYaws(level))
  const [fiberMeters, setFiberMeters] = useState([])
  const [displayCouplingById, setDisplayCouplingById] = useState({})
  const containerRef = useRef(null)
  const saved3DViewRef = useRef(null)
  const nativeFullscreenSupported = isNativeFullscreenSupported()
  const isFullscreen = isNativeFullscreen || isExpandedFallback

  const handleSave3DView = useCallback((view) => {
    saved3DViewRef.current = view
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(getFullscreenElement() === containerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    handleFullscreenChange()

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (!isExpandedFallback) {
      return undefined
    }

    const previousBodyOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
    }
  }, [isExpandedFallback])

  useEffect(() => {
    setDisplayCouplingById((current) =>
      Object.fromEntries(
        fiberMeters.map((meter) => [
          meter.id,
          meter.coupling > 0 ? (current[meter.id] ?? meter.coupling) : 0,
        ]),
      ),
    )
  }, [fiberMeters])

  useEffect(() => {
    if (fiberMeters.length === 0) {
      setDisplayCouplingById({})
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setDisplayCouplingById((current) =>
        Object.fromEntries(
          fiberMeters.map((meter) => {
            const coupling = meter.coupling ?? 0

            if (!(coupling > 0)) {
              return [meter.id, 0]
            }

            const amplitude = Math.min(0.022, Math.max(0.0045, coupling * 0.07))
            const target = clamp01(coupling + (Math.random() * 2 - 1) * amplitude)
            const previous = current[meter.id] ?? coupling

            return [meter.id, previous + (target - previous) * 1]
          }),
        ),
      )
    }, 120)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [fiberMeters])

  const handleToggleFullscreen = useCallback(async () => {
    const element = containerRef.current

    if (!element) {
      return
    }

    if (isNativeFullscreen) {
      await exitNativeFullscreen()
      return
    }

    if (isExpandedFallback) {
      setIsExpandedFallback(false)
      return
    }

    if (canUseNativeFullscreen(element)) {
      try {
        const enteredNativeFullscreen = await requestNativeFullscreen(element)

        if (enteredNativeFullscreen) {
          return
        }
      } catch {
        setIsExpandedFallback(true)
        return
      }
    }

    setIsExpandedFallback(true)
  }, [isExpandedFallback, isNativeFullscreen])

  const handleFirst3DInteraction = useCallback(() => {
    setHasUserInteracted3D(true)
  }, [])

  const handleOpticYawChange = useCallback((id, yaw) => {
    setOpticYaws((current) => ({
      ...current,
      [id]: yaw,
    }))
  }, [])

  const handleReset = useCallback(() => {
    setOpticYaws(buildInitialOpticYaws(level))
  }, [level])

  const handleJitter = useCallback(() => {
    const initialOpticYaws = buildInitialOpticYaws(level)
    const jitterAmount = 0.02

    setOpticYaws((current) =>
      Object.fromEntries(
        level.optics.map((optic) => {
          const baseYaw = current[optic.id] ?? initialOpticYaws[optic.id] ?? 0
          const nextYaw = baseYaw + (Math.random() * 2 - 1) * jitterAmount

          return [optic.id, Math.atan2(Math.sin(nextYaw), Math.cos(nextYaw))]
        }),
      ),
    )
  }, [level])

  const fullscreenButtonLabel = isNativeFullscreen
    ? 'Exit fullscreen'
    : isExpandedFallback
      ? 'Collapse'
      : nativeFullscreenSupported
        ? 'Fullscreen'
        : 'Expand'
  const fullscreenButtonIcon = isNativeFullscreen || isExpandedFallback ? '🗗' : '⛶'

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: isExpandedFallback ? '100vw' : '100%',
        height: isFullscreen ? '100dvh' : undefined,
        position: isExpandedFallback ? 'fixed' : 'relative',
        inset: isExpandedFallback ? 0 : undefined,
        zIndex: isExpandedFallback ? 2147483647 : undefined,
        boxSizing: 'border-box',
        paddingTop: isExpandedFallback ? 'env(safe-area-inset-top)' : 0,
        paddingRight: isExpandedFallback ? 'env(safe-area-inset-right)' : 0,
        paddingBottom: isExpandedFallback ? 'env(safe-area-inset-bottom)' : 0,
        paddingLeft: isExpandedFallback ? 'env(safe-area-inset-left)' : 0,
        background: isExpandedFallback ? '#fff' : undefined,
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          height: TOP_CONTROL_BAR_HEIGHT,
          padding: '12px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2147483647,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <button
            onClick={handleReset}
            style={{
              ...baseControlStyle,
              cursor: 'pointer',
              justifyContent: 'center',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            Reset
          </button>
          <button
            onClick={handleJitter}
            style={{
              ...baseControlStyle,
              cursor: 'pointer',
              justifyContent: 'center',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            Jitter
          </button>
          <button
            onClick={() => setIs2D((v) => !v)}
            style={{
              ...baseControlStyle,
              cursor: 'pointer',
              justifyContent: 'center',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            {is2D ? '▭ 2D' : '⬡ 3D'}
          </button>
          <button
            onClick={handleToggleFullscreen}
            title={fullscreenButtonLabel}
            aria-label={fullscreenButtonLabel}
            style={{
              ...baseControlStyle,
              cursor: 'pointer',
              justifyContent: 'center',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            {fullscreenButtonIcon}
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: isFullscreen ? 1 : undefined,
          minHeight: 0,
          aspectRatio: isFullscreen ? undefined : EMBED_ASPECT_RATIO,
        }}
      >
        <Canvas
          key={is2D ? '2d' : '3d'}
          shadows
          orthographic={is2D}
          camera={
            is2D
              ? { position: [0, 15, 0], zoom: 80, near: 0.1, far: 100 }
              : { position: [0, 8.5, 8.5], fov: 50 }
          }
          dpr={[1, 2]}
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <OpticalScene
            is2D={is2D}
            level={level}
            opticYaws={opticYaws}
            onOpticYawChange={handleOpticYawChange}
            hasUserInteracted3D={hasUserInteracted3D}
            onFirst3DInteraction={handleFirst3DInteraction}
            saved3DView={saved3DViewRef.current}
            onSave3DView={handleSave3DView}
            topInsetPx={0}
            onFiberMetersChange={setFiberMeters}
          />
        </Canvas>
      </div>

      <div
        style={{
          minHeight: POWER_METER_BAR_HEIGHT,
          padding: '0 12px 12px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2147483647,
        }}
      >
        {fiberMeters.map((meter) => {
          const displayCoupling = displayCouplingById[meter.id] ?? meter.coupling
          const couplingPercent = Math.round(meter.coupling * 100)

          return (
            <div
              key={meter.id}
              style={{
                ...baseControlStyle,
                flex: '1 1 0',
                minWidth: 0,
                gap: 6,
                padding: '0 10px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{meter.label}</span>
              <div
                style={{
                  flex: 1,
                  minWidth: 40,
                  height: 6,
                  background: '#e5e7eb',
                  borderRadius: 999,
                  overflow: 'hidden',
                  flexShrink: 1,
                }}
              >
                <div
                  style={{
                    width: `${displayCoupling * 100}%`,
                    height: '100%',
                    background: meter.color,
                    transition: 'width 120ms linear',
                  }}
                />
              </div>
              <span>{couplingPercent}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
