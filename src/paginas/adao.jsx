import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, Center, useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import './adao.css'

function ModeloRedbull(props) {
  const grupoRef = useRef(null)
  const { scene } = useGLTF('/3d/redbull_otimizado.glb')

  // parado no lugar, só balançando: sobe/desce e gira levemente para os lados
  useFrame(({ clock }) => {
    if (grupoRef.current) {
      grupoRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.05
      grupoRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <group ref={grupoRef} {...props}>

      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

useGLTF.preload('/3d/redbull_otimizado.glb')

function Adao({ entradaRef }) {
  const parallaxAdaoRef = useRef(null)
  const parallaxRedbullRef = useRef(null)
  const parallaxDeusRef = useRef(null)

  // wrappers usados só pra animação de entrada (o parallax do mouse continua
  // rodando nos refs acima, por cima dessa animação)
  const entradaAdaoElRef = useRef(null)
  const entradaRedbullElRef = useRef(null)
  const entradaDeusElRef = useRef(null)
  const entradaTlRef = useRef(null)

  // timeline pausada: progress 0 = tudo fora de tela (posição de partida),
  // progress 1 = tudo no lugar. Toca pra frente ao descer e reverte ao subir
  useEffect(() => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
    tl.fromTo(entradaAdaoElRef.current, { xPercent: -140 }, { xPercent: 0, duration: 1.8 }, 0)
    tl.fromTo(entradaDeusElRef.current, { xPercent: 140 }, { xPercent: 0, duration: 1.8 }, 0.25)
    tl.fromTo(entradaRedbullElRef.current, { yPercent: -160 }, { yPercent: 0, duration: 1.6 }, 0.5)
    entradaTlRef.current = tl

    return () => {
      tl.kill()
      entradaTlRef.current = null
    }
  }, [])

  // expõe uma função que toca a entrada sozinha (sem depender do scroll pra
  // animar), mas que o pai chama de novo, com a direção, quando o scroll
  // volta, revertendo os personagens pra onde vieram
  useEffect(() => {
    if (!entradaRef) return

    entradaRef.current = (direcao) => {
      const tl = entradaTlRef.current
      if (!tl) return

      if (direcao === -1) {
        tl.reverse()
      } else {
        tl.play()
      }
    }

    return () => {
      if (entradaRef.current) entradaRef.current = null
    }
  }, [entradaRef])

  useEffect(() => {
    const alvoAdao = parallaxAdaoRef.current
    const alvoRedbull = parallaxRedbullRef.current
    const alvoDeus = parallaxDeusRef.current
    if (!alvoAdao || !alvoRedbull || !alvoDeus) return

    const config = {
      adao: { x: 68, y: 60 },     // movimentos parallax
      redbull: { x: 0, y: -20 },  // profundidade intermediária, entre Adão e Deus
      deus: { x: -68, y: -60 },
    }

    const opcoesQuickTo = { duration: 0.7, ease: 'power3.out' }

    const setAdaoX = gsap.quickTo(alvoAdao, 'x', opcoesQuickTo)
    const setAdaoY = gsap.quickTo(alvoAdao, 'y', opcoesQuickTo)
    const setRedbullX = gsap.quickTo(alvoRedbull, 'x', opcoesQuickTo)
    const setRedbullY = gsap.quickTo(alvoRedbull, 'y', opcoesQuickTo)
    const setDeusX = gsap.quickTo(alvoDeus, 'x', opcoesQuickTo)
    const setDeusY = gsap.quickTo(alvoDeus, 'y', opcoesQuickTo)

    const aoMoverMouse = (evento) => {
      const px = evento.clientX / window.innerWidth - 0.5
      const py = evento.clientY / window.innerHeight - 0.5

      setAdaoX(px * config.adao.x)
      setAdaoY(py * config.adao.y)
      setRedbullX(px * config.redbull.x)
      setRedbullY(py * config.redbull.y)
      setDeusX(px * config.deus.x)
      setDeusY(py * config.deus.y)
    }

    window.addEventListener('mousemove', aoMoverMouse)
    return () => window.removeEventListener('mousemove', aoMoverMouse)
  }, [])

  return (
    <section className="adao-secao">
      <img
        src="/adao/desenho.png"
        alt=""
        className="adao-fundo"
        draggable={false}
      />

      <div ref={parallaxAdaoRef} className="adao-parallax">
        <div ref={entradaAdaoElRef} className="adao-entrada">
          <img
            src="/adao/adao.webp"
            alt="Adão"
            className="adao-personagem adao-personagem-adao"
            draggable={false}
          />
        </div>
      </div>

      <div ref={parallaxRedbullRef} className="adao-parallax">
        <div ref={entradaRedbullElRef} className="adao-entrada">
          <div className="adao-personagem adao-personagem-redbull">
            <Canvas
              camera={{ fov: 35 }}
              gl={{ alpha: true }}
              dpr={[1, 2]}
              style={{ pointerEvents: 'none' }}
            >
              <ambientLight intensity={5} />
              <directionalLight position={[3, 5, 2]} intensity={2.5} />
              <directionalLight position={[-3, 5, 2]} intensity={2.5} />
              <directionalLight position={[3, -5, 2]} intensity={2} />
              <directionalLight position={[-3, -5, 2]} intensity={2} />
              <directionalLight position={[0, 0, 5]} intensity={2} />
              <directionalLight position={[0, 0, -5]} intensity={2} />
              <Suspense fallback={null}>
                <Bounds fit clip observe margin={1.2}>
                  <ModeloRedbull />
                </Bounds>
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>

      <div ref={parallaxDeusRef} className="adao-parallax">
        <div ref={entradaDeusElRef} className="adao-entrada">
          <img
            src="/adao/deus.webp"
            alt="Deus"
            className="adao-personagem adao-personagem-deus"
            draggable={false}
          />
        </div>
      </div>
    </section>
  )
}

export default Adao