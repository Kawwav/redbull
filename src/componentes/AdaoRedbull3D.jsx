import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import './AdaoRedbull3D.css'

const ESCALA_INICIAL = 0.55
const ESCALA_FINAL = 1.4

const AMORTECIMENTO_POSICAO = 3.2
const AMORTECIMENTO_ESCALA = 2.6

const AMPLITUDE_BALANCO_Y = 0.05
const VELOCIDADE_BALANCO_Y = 0.8

const PLANO_PROFUNDIDADE = 0

function obterPosicaoElementoNoMundo(elementoRef, camera, size, raycaster, plano, vetorSaida) {
  const elemento = elementoRef?.current
  if (!elemento || !camera || !size) return null

  const retangulo = elemento.getBoundingClientRect()
  if (retangulo.width === 0 && retangulo.height === 0) return null

  const centroX = retangulo.left + retangulo.width / 2
  const centroY = retangulo.top + retangulo.height / 2

  const ndcX = (centroX / size.width) * 2 - 1
  const ndcY = -(centroY / size.height) * 2 + 1

  raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera)
  const encontrou = raycaster.ray.intersectPlane(plano, vetorSaida)

  return encontrou ? vetorSaida : null
}

function ModeloAdaoRedbull({ inicioRef, fimRef, progressoRef }) {
  const { scene } = useGLTF('/3d/redbull_otimizado.glb')

  const grupoPosicaoRef = useRef(null)
  const grupoEscalaRef = useRef(null)
  const grupoBalancoRef = useRef(null)

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plano = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANO_PROFUNDIDADE),
    []
  )
  const posInicio = useMemo(() => new THREE.Vector3(), [])
  const posFim = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (grupoEscalaRef.current) grupoEscalaRef.current.scale.setScalar(0)
  }, [])

  useFrame((state, deltaFrame) => {
    if (!grupoPosicaoRef.current || !grupoEscalaRef.current || !grupoBalancoRef.current) return

    const progresso = progressoRef?.current ?? 0

    const inicio = obterPosicaoElementoNoMundo(
      inicioRef,
      state.camera,
      state.size,
      raycaster,
      plano,
      posInicio
    )
    const fim = obterPosicaoElementoNoMundo(
      fimRef,
      state.camera,
      state.size,
      raycaster,
      plano,
      posFim
    )

    const elementoInicio = inicioRef?.current
    const cenaAdao = elementoInicio?.closest('.brasil-cena')
    const opacidadeCena = cenaAdao ? parseFloat(getComputedStyle(cenaAdao).opacity) || 0 : 1
    const delta = Math.min(deltaFrame || 1 / 60, 1 / 15)

    if (inicio && fim) {
      const alvoX = gsap.utils.interpolate(inicio.x, fim.x, progresso)
      const alvoY = gsap.utils.interpolate(inicio.y, fim.y, progresso)

      grupoPosicaoRef.current.position.x = THREE.MathUtils.damp(
        grupoPosicaoRef.current.position.x,
        alvoX,
        AMORTECIMENTO_POSICAO,
        delta
      )
      grupoPosicaoRef.current.position.y = THREE.MathUtils.damp(
        grupoPosicaoRef.current.position.y,
        alvoY,
        AMORTECIMENTO_POSICAO,
        delta
      )
    }

    const escalaAlvo = gsap.utils.interpolate(ESCALA_INICIAL, ESCALA_FINAL, progresso) * opacidadeCena
    const escalaAtual = grupoEscalaRef.current.scale.x
    const novaEscala = THREE.MathUtils.damp(escalaAtual, escalaAlvo, AMORTECIMENTO_ESCALA, delta)
    grupoEscalaRef.current.scale.setScalar(novaEscala)

    grupoBalancoRef.current.position.y =
      Math.sin(state.clock.elapsedTime * VELOCIDADE_BALANCO_Y) * AMPLITUDE_BALANCO_Y
  })

  return (
    <group ref={grupoPosicaoRef}>
      <group ref={grupoEscalaRef}>
        <group ref={grupoBalancoRef}>
          <Center>
            <primitive object={scene} />
          </Center>
        </group>
      </group>
    </group>
  )
}

function AdaoRedbull3D({ inicioRef, fimRef, progressoRef }) {
  return (
    <div className="adao-redbull-modelo" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.15, 3.2], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <ambientLight intensity={2.2} />
        <directionalLight position={[3, 4, 5]} intensity={3} />
        <directionalLight position={[-3, 1, -4]} intensity={1.6} />
        <directionalLight position={[0, 3, 3]} intensity={2} />
        <directionalLight position={[0, -2, 2]} intensity={1.4} />

        <Suspense fallback={null}>
          <ModeloAdaoRedbull inicioRef={inicioRef} fimRef={fimRef} progressoRef={progressoRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/3d/redbull_otimizado.glb')

export default AdaoRedbull3D