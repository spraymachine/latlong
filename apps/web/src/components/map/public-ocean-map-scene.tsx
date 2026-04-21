"use client"

import { Line, OrbitControls, Stars, useGLTF } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { getCelestialSnapshot } from "@/lib/celestial/clock"
import type { PublicVoyage } from "@/lib/data/public-feed"
import { ATLAS_LANDMARKS } from "@/lib/globe/atlas-landmarks"
import { getNormalizedGlobeScale } from "@/lib/globe/fit"
import { EARTH_MODEL_SRC } from "@/lib/globe/model"
import { buildGlobeSignals, type GlobeSignal } from "@/lib/globe/signals"
import {
  EARTH_VIEW_CAMERA_FOV,
  EARTH_VIEW_CAMERA_POSITION_Z,
  EARTH_VIEW_OFFSET_Y,
  EARTH_VIEW_TARGET_LARGEST_DIMENSION,
} from "@/lib/globe/view"

import { usePublicOceanSceneStore } from "./public-ocean-map-store"

type PublicOceanMapSceneProps = {
  voyages: PublicVoyage[]
  activeVoyageId?: string
  className?: string
}

type IndexedWaypoint = {
  postId: string
  voyageId: string
  voyageTitle: string
  voyageAuthorName: string
  postedAt: string
  caption: string
  imageUrl: string
  latitude: number
  longitude: number
}

type IndexedLandmark = {
  landmarkId: string
  title: string
  description: string
  latitude: number
  longitude: number
}

type EarthShaderHandle = {
  uniforms: {
    uSunDirection: {
      value: THREE.Vector3
    }
  }
}

const MODEL_SIGNAL_RADIUS = 1.06
const MODEL_ROTATION: [number, number, number] = [0.16, -0.92, 0.04]
const MODEL_GROUP_POSITION: [number, number, number] = [0, EARTH_VIEW_OFFSET_Y, 0]
const GLOBE_MIN_DISTANCE = 2.6
const GLOBE_MAX_DISTANCE = 4.4

function formatCoordinate(value: number, positive: string, negative: string) {
  const direction = value >= 0 ? positive : negative
  return `${Math.abs(value).toFixed(2)}° ${direction}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function latLongToVector3(
  latitude: number,
  longitude: number,
  radius: number,
  altitude = 0,
) {
  const phi = ((90 - latitude) * Math.PI) / 180
  const theta = ((longitude + 180) * Math.PI) / 180
  const effectiveRadius = radius + altitude

  return new THREE.Vector3(
    -effectiveRadius * Math.sin(phi) * Math.cos(theta),
    effectiveRadius * Math.cos(phi),
    effectiveRadius * Math.sin(phi) * Math.sin(theta),
  )
}

function buildWaypointIndex(voyages: PublicVoyage[]) {
  return new Map(
    voyages.flatMap((voyage) =>
      voyage.posts.map((post) => [
        `voyage:${post.id}`,
        {
          postId: post.id,
          voyageId: voyage.id,
          voyageTitle: voyage.title,
          voyageAuthorName: voyage.authorName,
          postedAt: post.postedAt,
          caption: post.caption,
          imageUrl: post.imageUrl,
          latitude: post.latitude,
          longitude: post.longitude,
        } satisfies IndexedWaypoint,
      ]),
    ),
  )
}

function buildLandmarkIndex() {
  return new Map(
    ATLAS_LANDMARKS.map((landmark) => [
      `landmark:${landmark.id}`,
      {
        landmarkId: landmark.id,
        title: landmark.title,
        description: landmark.description,
        latitude: landmark.latitude,
        longitude: landmark.longitude,
      } satisfies IndexedLandmark,
    ]),
  )
}

function EarthModel({ sunDirection }: { sunDirection: THREE.Vector3 }) {
  const { scene } = useGLTF(EARTH_MODEL_SRC)
  const shaderRefs = useRef<EarthShaderHandle[]>([])

  const { model, scale, position } = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const normalizedScale = getNormalizedGlobeScale(
      [size.x, size.y, size.z],
      EARTH_VIEW_TARGET_LARGEST_DIMENSION,
    )

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false
        child.receiveShadow = false

        if (Array.isArray(child.material)) {
          child.material = child.material.map((material) => material.clone())
        } else if (child.material) {
          child.material = child.material.clone()
        }

        const materials = Array.isArray(child.material) ? child.material : [child.material]

        for (const material of materials) {
          if (!(material instanceof THREE.MeshStandardMaterial)) {
            continue
          }

          material.roughness = Math.min(material.roughness ?? 1, 0.95)
          material.metalness = 0
          material.onBeforeCompile = (shader) => {
            shader.uniforms.uSunDirection = { value: sunDirection.clone() }
            shaderRefs.current.push(shader as unknown as EarthShaderHandle)

            shader.vertexShader = shader.vertexShader
              .replace(
                "#include <common>",
                `#include <common>
                varying vec3 vWorldNormal;`,
              )
              .replace(
                "#include <beginnormal_vertex>",
                `#include <beginnormal_vertex>
                vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
              )

            shader.fragmentShader = shader.fragmentShader
              .replace(
                "#include <common>",
                `#include <common>
                uniform vec3 uSunDirection;
                varying vec3 vWorldNormal;`,
              )
              .replace(
                "#include <dithering_fragment>",
                `#include <dithering_fragment>
                float daylight = clamp(dot(normalize(vWorldNormal), normalize(uSunDirection)) * 0.5 + 0.5, 0.0, 1.0);
                float terminator = smoothstep(0.18, 0.7, daylight);
                float nightLift = 0.34;
                gl_FragColor.rgb *= mix(vec3(nightLift, nightLift * 1.04, nightLift * 1.08), vec3(1.0), terminator);`,
              )
          }

          material.needsUpdate = true
        }
      }
    })

    return {
      model: clone,
      scale: normalizedScale,
      position: [
        -center.x * normalizedScale,
        -center.y * normalizedScale,
        -center.z * normalizedScale,
      ] as [number, number, number],
    }
  }, [scene])

  useEffect(() => {
    for (const shader of shaderRefs.current) {
      shader.uniforms.uSunDirection.value.copy(sunDirection)
    }
  }, [sunDirection])

  return <primitive object={model} scale={scale} position={position} />
}

function GlobeShell({ sunDirection }: { sunDirection: THREE.Vector3 }) {
  const glowRef = useMemo(() => new THREE.Color("#6fe0cd"), [])

  return (
    <group>
      <EarthModel sunDirection={sunDirection} />
      <mesh scale={1.015}>
        <sphereGeometry args={[MODEL_SIGNAL_RADIUS, 64, 64]} />
        <meshBasicMaterial color={glowRef} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function TerminatorDashedLine({ localSunDirection }: { localSunDirection: THREE.Vector3 }) {
  const dashSegments = useMemo(() => {
    const normal = localSunDirection.clone().normalize()
    const reference =
      Math.abs(normal.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const tangentA = new THREE.Vector3().crossVectors(normal, reference).normalize()
    const tangentB = new THREE.Vector3().crossVectors(normal, tangentA).normalize()
    const radius = MODEL_SIGNAL_RADIUS + 0.012
    const segmentCount = 36
    const segmentArc = (Math.PI * 2) / segmentCount
    const dashRatio = 0.68

    return Array.from({ length: segmentCount }, (_, index) => {
      const startAngle = index * segmentArc
      const endAngle = startAngle + segmentArc * dashRatio
      const start = tangentA
        .clone()
        .multiplyScalar(Math.cos(startAngle))
        .add(tangentB.clone().multiplyScalar(Math.sin(startAngle)))
        .multiplyScalar(radius)
      const end = tangentA
        .clone()
        .multiplyScalar(Math.cos(endAngle))
        .add(tangentB.clone().multiplyScalar(Math.sin(endAngle)))
        .multiplyScalar(radius)

      return {
        key: index,
        points: [start, end] as [THREE.Vector3, THREE.Vector3],
      }
    })
  }, [localSunDirection])

  return (
    <>
      {dashSegments.map((segment) => (
        <Line
          key={segment.key}
          points={segment.points}
          color="#fff6de"
          lineWidth={0.52}
          transparent
          opacity={0.66}
        />
      ))}
    </>
  )
}

function RouteArcs({
  voyages,
  activeVoyageId,
  zoomTension,
}: {
  voyages: PublicVoyage[]
  activeVoyageId: string | null
  zoomTension: number
}) {
  return (
    <>
      {voyages.map((voyage) => {
        const isActive = voyage.id === activeVoyageId
        const routePoints = voyage.routeLine.geometry.coordinates.map(([longitude, latitude]) =>
          latLongToVector3(latitude, longitude, MODEL_SIGNAL_RADIUS, isActive ? 0.085 : 0.055),
        )

        return (
          <Line
            key={voyage.id}
            points={routePoints}
            color={isActive ? "#f4cf85" : "#5bcdf5"}
            lineWidth={(isActive ? 0.82 : 0.42) + zoomTension * (isActive ? 0.52 : 0.34)}
            transparent
            opacity={isActive ? 0.88 : 0.3}
          />
        )
      })}
    </>
  )
}

function SignalPulse({
  position,
  color,
  size,
}: {
  position: THREE.Vector3
  color: string
  size: number
}) {
  const meshRef = useMemo(() => ({ current: null as THREE.Mesh | null }), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.16
    meshRef.current.scale.setScalar(pulse)
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    material.opacity = 0.12 + (pulse - 1) * 0.15
  })

  return (
    <mesh ref={(node) => void (meshRef.current = node)} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
    </mesh>
  )
}

function SignalBeams({
  signals,
  activeVoyageId,
  selectedSignalId,
  zoomTension,
  onFocusVoyage,
  onSelectSignal,
}: {
  signals: GlobeSignal[]
  activeVoyageId: string | null
  selectedSignalId: string | null
  zoomTension: number
  onFocusVoyage: (voyageId: string) => void
  onSelectSignal: (signal: GlobeSignal) => void
}) {
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), [])

  useEffect(() => {
    return () => {
      sphereGeometry.dispose()
    }
  }, [sphereGeometry])

  return (
    <>
      {signals.map((signal) => {
        const isSelected = signal.id === selectedSignalId
        const isActiveVoyage = signal.kind === "voyage" && signal.voyageId === activeVoyageId
        const baseSize = signal.kind === "landmark" ? 0.023 : 0.019
        const surface = latLongToVector3(signal.latitude, signal.longitude, MODEL_SIGNAL_RADIUS, 0.014)
        const pointSize =
          baseSize -
          zoomTension * (signal.kind === "landmark" ? 0.008 : 0.007) +
          (isSelected ? 0.004 : isActiveVoyage ? 0.0015 : 0)
        const haloSize = pointSize * (signal.kind === "landmark" ? 2.9 : 2.6)
        const outerHaloSize = pointSize * (signal.kind === "landmark" ? 4.1 : 3.6)
        const beamColor =
          signal.kind === "landmark"
            ? isSelected
              ? "#fff2d2"
              : "#d89b4d"
            : isSelected
              ? "#ecfff8"
              : isActiveVoyage
                ? "#8bf0d2"
                : "#3fd2b4"
        const haloColor = signal.kind === "landmark" ? "#f0bc78" : "#74f2dc"
        const topCapColor = signal.kind === "landmark" ? "#fff7e8" : "#d9fff4"

        return (
          <group
            key={signal.id}
            onPointerEnter={() => {
              if (signal.kind === "voyage") {
                onFocusVoyage(signal.voyageId)
              }
            }}
            onClick={(event) => {
              event.stopPropagation()
              onSelectSignal(signal)
            }}
          >
            <mesh position={surface} scale={outerHaloSize}>
              <primitive object={sphereGeometry} attach="geometry" />
              <meshBasicMaterial
                color={haloColor}
                transparent
                opacity={signal.kind === "landmark" ? 0.06 : isSelected ? 0.11 : isActiveVoyage ? 0.08 : 0.05}
                depthWrite={false}
              />
            </mesh>
            <mesh position={surface} scale={haloSize}>
              <primitive object={sphereGeometry} attach="geometry" />
              <meshBasicMaterial
                color={haloColor}
                transparent
                opacity={signal.kind === "landmark" ? 0.14 : isSelected ? 0.22 : isActiveVoyage ? 0.16 : 0.1}
                depthWrite={false}
              />
            </mesh>
            <mesh position={surface} scale={pointSize}>
              <primitive object={sphereGeometry} attach="geometry" />
              <meshBasicMaterial color={beamColor} transparent opacity={0.96} depthWrite={false} />
            </mesh>
            <mesh position={surface} scale={pointSize * 0.38}>
              <primitive object={sphereGeometry} attach="geometry" />
              <meshBasicMaterial color={topCapColor} transparent opacity={0.92} depthWrite={false} />
            </mesh>
            {isSelected ? <SignalPulse position={surface} color={beamColor} size={pointSize * 0.92} /> : null}
          </group>
        )
      })}
    </>
  )
}

function CameraDistanceTracker({
  onDistanceChange,
}: {
  onDistanceChange: (distance: number) => void
}) {
  const { camera } = useThree()
  const lastDistanceRef = useRef<number | null>(null)

  useFrame(() => {
    const distance = camera.position.length()

    if (lastDistanceRef.current !== null && Math.abs(lastDistanceRef.current - distance) < 0.04) {
      return
    }

    lastDistanceRef.current = distance
    onDistanceChange(distance)
  })

  return null
}

function GlobeStage({
  voyages,
  activeVoyageId,
  selectedSignalId,
  zoomTension,
  sunDirection,
  onCameraDistanceChange,
  onClearSelection,
  onFocusVoyage,
  onSelectSignal,
}: {
  voyages: PublicVoyage[]
  activeVoyageId: string | null
  selectedSignalId: string | null
  zoomTension: number
  sunDirection: THREE.Vector3
  onCameraDistanceChange: (distance: number) => void
  onClearSelection: () => void
  onFocusVoyage: (voyageId: string) => void
  onSelectSignal: (signal: GlobeSignal) => void
}) {
  const signals = useMemo(() => buildGlobeSignals(voyages), [voyages])
  const localSunDirection = useMemo(() => {
    const inverseRotation = new THREE.Euler(
      -MODEL_ROTATION[0],
      -MODEL_ROTATION[1],
      -MODEL_ROTATION[2],
    )

    return sunDirection.clone().applyEuler(inverseRotation).normalize()
  }, [sunDirection])

  return (
    <Canvas
      camera={{ position: [0, 0, EARTH_VIEW_CAMERA_POSITION_Z], fov: EARTH_VIEW_CAMERA_FOV }}
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true }}
    >
      <color attach="background" args={["#01050a"]} />
      <ambientLight intensity={0.34} color="#dceeff" />
      <hemisphereLight intensity={0.42} color="#b9dfff" groundColor="#08131f" />
      <directionalLight
        position={sunDirection.clone().multiplyScalar(4.2).toArray()}
        intensity={2.3}
        color="#fff1cf"
      />
      <directionalLight position={[-2, -1, -3]} intensity={0.18} color="#4a87b0" />
      <Stars radius={85} depth={40} count={2200} factor={3} saturation={0} fade speed={0.25} />

      <group position={MODEL_GROUP_POSITION} rotation={MODEL_ROTATION}>
        <GlobeShell sunDirection={sunDirection} />
        <TerminatorDashedLine localSunDirection={localSunDirection} />
        <RouteArcs voyages={voyages} activeVoyageId={activeVoyageId} zoomTension={zoomTension} />
        <SignalBeams
          signals={signals}
          activeVoyageId={activeVoyageId}
          selectedSignalId={selectedSignalId}
          zoomTension={zoomTension}
          onFocusVoyage={onFocusVoyage}
          onSelectSignal={onSelectSignal}
        />
      </group>
      <CameraDistanceTracker onDistanceChange={onCameraDistanceChange} />

      <OrbitControls
        enablePan={false}
        enableZoom
        rotateSpeed={0.42}
        autoRotate={selectedSignalId === null}
        autoRotateSpeed={0.32}
        target={[0, EARTH_VIEW_OFFSET_Y, 0]}
        minDistance={GLOBE_MIN_DISTANCE}
        maxDistance={GLOBE_MAX_DISTANCE}
        minPolarAngle={Math.PI * 0.24}
        maxPolarAngle={Math.PI * 0.76}
      />
      <mesh onClick={onClearSelection} position={[0, 0, -8]} visible={false}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </Canvas>
  )
}

export function PublicOceanMapScene({
  voyages,
  activeVoyageId,
  className,
}: PublicOceanMapSceneProps) {
  const deferredVoyages = useDeferredValue(voyages)
  const focusedVoyageId = usePublicOceanSceneStore((state) => state.focusedVoyageId)
  const selectedSignalId = usePublicOceanSceneStore((state) => state.selectedSignalId)
  const setFocusedVoyageId = usePublicOceanSceneStore((state) => state.setFocusedVoyageId)
  const setSelectedSignalId = usePublicOceanSceneStore((state) => state.setSelectedSignalId)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (selectedSignalId) {
      return
    }

    setFocusedVoyageId(activeVoyageId ?? deferredVoyages[0]?.id ?? null)
  }, [activeVoyageId, deferredVoyages, selectedSignalId, setFocusedVoyageId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const waypointIndex = useMemo(() => buildWaypointIndex(deferredVoyages), [deferredVoyages])
  const landmarkIndex = useMemo(() => buildLandmarkIndex(), [])
  const selectedWaypoint = selectedSignalId ? waypointIndex.get(selectedSignalId) ?? null : null
  const selectedLandmark = selectedSignalId ? landmarkIndex.get(selectedSignalId) ?? null : null
  const [cameraDistance, setCameraDistance] = useState(EARTH_VIEW_CAMERA_POSITION_Z)
  const effectiveVoyageId =
    selectedWaypoint?.voyageId ??
    focusedVoyageId ??
    activeVoyageId ??
    deferredVoyages[0]?.id ??
    null
  const activeVoyage =
    deferredVoyages.find((voyage) => voyage.id === effectiveVoyageId) ??
    deferredVoyages[0] ??
    null
  const totalSignals = deferredVoyages.reduce((count, voyage) => count + voyage.posts.length, 0)
  const zoomTension = useMemo(() => {
    const clampedDistance = Math.min(Math.max(cameraDistance, GLOBE_MIN_DISTANCE), GLOBE_MAX_DISTANCE)

    return 1 - (clampedDistance - GLOBE_MIN_DISTANCE) / (GLOBE_MAX_DISTANCE - GLOBE_MIN_DISTANCE)
  }, [cameraDistance])
  const celestial = useMemo(() => getCelestialSnapshot(now), [now])
  const sunDirection = useMemo(
    () =>
      latLongToVector3(
        celestial.solar.subpoint.latitude,
        celestial.solar.subpoint.longitude,
        1,
      ).normalize(),
    [celestial.solar.subpoint.latitude, celestial.solar.subpoint.longitude],
  )

  const handleSelectSignal = (signal: GlobeSignal) => {
    startTransition(() => {
      if (signal.kind === "voyage") {
        setFocusedVoyageId(signal.voyageId)
      }

      setSelectedSignalId(signal.id)
    })
  }

  const handleFocusVoyage = (voyageId: string) => {
    if (selectedSignalId?.startsWith("landmark:")) {
      return
    }

    startTransition(() => {
      setFocusedVoyageId(voyageId)
    })
  }

  const handleClearSelection = () => {
    startTransition(() => {
      setSelectedSignalId(null)
      setFocusedVoyageId(activeVoyageId ?? deferredVoyages[0]?.id ?? null)
    })
  }

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] bg-[#01050a] shadow-[0_40px_120px_rgba(0,0,0,0.45)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_12%,rgba(101,218,249,0.14),transparent_28%),radial-gradient(circle_at_50%_88%,rgba(244,207,133,0.08),transparent_24%)]" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-5 py-5">
        <div className="max-w-[18rem] rounded-[1.4rem] border border-white/8 bg-black/30 px-4 py-3 backdrop-blur">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#7fdcff]">
            LatLong Atlas
          </p>
          <p className="mt-2 text-sm leading-6 text-[#d6e8f4]">
            Voyage beams rise from exact coordinates. Famous waypoints stay charted as warmer fixed signals.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-white/8 bg-black/30 px-4 py-3 text-right backdrop-blur">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#f0d69a]">
            Live atlas
          </p>
          <p className="mt-2 text-sm text-[#eef7ff]">{deferredVoyages.length} voyages</p>
          <p className="mt-1 text-sm text-[#c6d6e0]">{totalSignals} voyage beams</p>
          <p className="mt-1 text-sm text-[#c6d6e0]">{ATLAS_LANDMARKS.length} landmarks</p>
        </div>
      </div>

      <div className="h-[100dvh] min-h-[720px] w-full">
        <GlobeStage
          voyages={deferredVoyages}
          activeVoyageId={effectiveVoyageId}
          selectedSignalId={selectedSignalId}
          zoomTension={zoomTension}
          sunDirection={sunDirection}
          onCameraDistanceChange={setCameraDistance}
          onClearSelection={handleClearSelection}
          onFocusVoyage={handleFocusVoyage}
          onSelectSignal={handleSelectSignal}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/8 bg-[linear-gradient(180deg,rgba(1,5,10,0),rgba(1,5,10,0.92))] px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#7fdcff]">
              {selectedLandmark ? "Charted place" : "Active voyage"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#f7fbff]">
              {selectedLandmark?.title ?? activeVoyage?.title ?? "Awaiting first voyage"}
            </h2>
            {selectedLandmark ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d6e8f4]">
                {selectedLandmark.description}
              </p>
            ) : activeVoyage ? (
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d6e8f4]">
                {activeVoyage.start.name} to {activeVoyage.end.name} with {activeVoyage.posts.length} published signals by {activeVoyage.authorName}.
              </p>
            ) : (
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d6e8f4]">
                Publish the first signal to turn this model into a living voyage atlas.
              </p>
            )}
          </div>

          {selectedWaypoint ? (
            <article className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-black/38 p-4 text-[#f4fbff] backdrop-blur sm:grid-cols-[200px_1fr]">
              <div className="relative h-40 overflow-hidden rounded-[1.1rem] bg-[#091624] sm:h-full">
                <img
                  src={selectedWaypoint.imageUrl}
                  alt={selectedWaypoint.caption || selectedWaypoint.voyageTitle}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,5,10,0.06),rgba(1,5,10,0.48))]" />
              </div>
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#7fdcff]">
                  Selected voyage beam
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#f7fbff]">
                  {selectedWaypoint.voyageTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#d6e8f4]">
                  {selectedWaypoint.caption || "Untitled signal"}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-[0.64rem] uppercase tracking-[0.22em] text-[#f0d69a]">
                  <span>{selectedWaypoint.voyageAuthorName}</span>
                  <span>{formatDate(selectedWaypoint.postedAt)}</span>
                </div>
                <div className="mt-4 grid gap-3 rounded-[1rem] border border-white/8 bg-white/4 p-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#9db5c4]">
                      Latitude
                    </p>
                    <p className="mt-1">{formatCoordinate(selectedWaypoint.latitude, "N", "S")}</p>
                  </div>
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#9db5c4]">
                      Longitude
                    </p>
                    <p className="mt-1">{formatCoordinate(selectedWaypoint.longitude, "E", "W")}</p>
                  </div>
                </div>
              </div>
            </article>
          ) : selectedLandmark ? (
            <article className="rounded-[1.5rem] border border-white/8 bg-black/38 p-4 text-[#f4fbff] backdrop-blur">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#f0d69a]">
                Landmark beam
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#f7fbff]">
                {selectedLandmark.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#d6e8f4]">
                {selectedLandmark.description}
              </p>
              <div className="mt-4 grid gap-3 rounded-[1rem] border border-white/8 bg-white/4 p-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#9db5c4]">
                    Latitude
                  </p>
                  <p className="mt-1">{formatCoordinate(selectedLandmark.latitude, "N", "S")}</p>
                </div>
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#9db5c4]">
                    Longitude
                  </p>
                  <p className="mt-1">{formatCoordinate(selectedLandmark.longitude, "E", "W")}</p>
                </div>
              </div>
            </article>
          ) : (
            <p className="max-w-lg justify-self-end text-right text-xs leading-5 text-[#a9bdca]">
              Drag the NASA globe, then tap a cyan voyage beam or a warm landmark beam to inspect the exact coordinates behind it.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

useGLTF.preload(EARTH_MODEL_SRC)
