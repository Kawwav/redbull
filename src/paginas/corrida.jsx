import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './corrida.css'

gsap.registerPlugin(ScrollTrigger)

// gira o carro no eixo Y até a ponta (frente) apontar pra direita da tela —
// ajuste em passos de Math.PI / 2 (90°) caso ainda não esteja no ângulo certo
const ROTACAO_Y_CARRO = Math.PI

// tamanho do modelo — diminua ainda mais se continuar cortando nas bordas
const ESCALA_CARRO = 0.55

// mesma lógica de rotação/escala, mas para a Ferrari que fica no meio da tela
const ROTACAO_Y_FERRARI = Math.PI
const ESCALA_FERRARI = 0.46

// mesma lógica, mas para a Red Bull que fica no canto direito
const ROTACAO_Y_REDBULL = Math.PI

const ROTACAO_X_REDBULL = -0.03
const ESCALA_REDBULL = 0.12

function Carro() {
  const { scene } = useGLTF('/3d/mclaren_mcl35m_light.glb')

  return (
    <Center>
      <primitive object={scene} scale={ESCALA_CARRO} rotation={[0, ROTACAO_Y_CARRO, 0]} />
    </Center>
  )
}

function Ferrari() {
  const { scene } = useGLTF('/3d/ferrari_f1_2019_light.glb')

  return (
    <Center>
      <primitive object={scene} scale={ESCALA_FERRARI} rotation={[0, ROTACAO_Y_FERRARI, 0]} />
    </Center>
  )
}

function RedBullCarro() {
  const { scene } = useGLTF('/3d/redbull_rb15_light.glb')

  return (
    <Center>
      <primitive
        object={scene}
        scale={ESCALA_REDBULL}
        rotation={[ROTACAO_X_REDBULL, ROTACAO_Y_REDBULL, 0]}
      />
    </Center>
  )
}

function Corrida() {
  const corridaRef = useRef(null)
  const textoRef = useRef(null)

  useEffect(() => {
    if (!corridaRef.current || !textoRef.current) return

    const ctx = gsap.context(() => {
      // o texto começa fora da tela, à direita, e desliza até a posição final
      // conforme o usuário rola — ligado direto ao progresso do scroll (scrub)
      gsap.fromTo(
        textoRef.current,
        { xPercent: 100, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: corridaRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        }
      )
    }, corridaRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={corridaRef} className="corrida">
      <div className="retangulo" />

      <div ref={textoRef} className="texto-corrida">
        <h2>Na F1 voamos com nossas asas</h2>
      </div>

      <div className="carro-modelo">
        <Canvas
          camera={{ position: [6, 0.6, 0], fov: 28 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <directionalLight position={[-3, 1, -4]} intensity={0.5} />

          <Suspense fallback={null}>
            <Carro />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      <div className="carro-modelo-centro">
        <Canvas
          camera={{ position: [6, 0.6, 0], fov: 28 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <directionalLight position={[-3, 1, -4]} intensity={0.5} />

          <Suspense fallback={null}>
            <Ferrari />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      <div className="carro-modelo-direita">
        <Canvas
          camera={{ position: [6, 0.6, 0], fov: 28 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <directionalLight position={[-3, 1, -4]} intensity={0.5} />

          <Suspense fallback={null}>
            <RedBullCarro />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}

export default Corrida

useGLTF.preload('/3d/mclaren_mcl35m_light.glb')
useGLTF.preload('/3d/ferrari_f1_2019_light.glb')
useGLTF.preload('/3d/redbull_rb15_light.glb')