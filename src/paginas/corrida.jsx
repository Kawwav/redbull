import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './corrida.css'

gsap.registerPlugin(ScrollTrigger)

const MATERIAIS_RODA = {
  mclaren: ['rim_png', 'tread_png', 'tyrewall_png'],
  ferrari: ['Tire'],
  redbull: ['Meshpart5Mtl.001', 'Meshpart15Mtl.001'],
}

const VELOCIDADE_RODA = 6

function separarEmIlhas(geometry) {
  const posAttr = geometry.getAttribute('position')
  const totalVertices = posAttr.count
  const indexAttr = geometry.index
  const totalTriangulos = indexAttr ? indexAttr.count / 3 : totalVertices / 3

  const pai = new Int32Array(totalVertices)
  for (let i = 0; i < totalVertices; i++) pai[i] = i

  const achar = (i) => {
    while (pai[i] !== i) {
      pai[i] = pai[pai[i]]
      i = pai[i]
    }
    return i
  }
  const unir = (a, b) => {
    const ra = achar(a)
    const rb = achar(b)
    if (ra !== rb) pai[ra] = rb
  }

  for (let t = 0; t < totalTriangulos; t++) {
    const a = indexAttr ? indexAttr.getX(t * 3) : t * 3
    const b = indexAttr ? indexAttr.getX(t * 3 + 1) : t * 3 + 1
    const c = indexAttr ? indexAttr.getX(t * 3 + 2) : t * 3 + 2
    unir(a, b)
    unir(b, c)
  }

  const grupos = new Map()
  for (let i = 0; i < totalVertices; i++) {
    const raiz = achar(i)
    if (!grupos.has(raiz)) grupos.set(raiz, [])
    grupos.get(raiz).push(i)
  }
  return Array.from(grupos.values())
}

function criarRodasIndependentes(meshOriginal) {
  const geometry = meshOriginal.geometry
  const ilhas = separarEmIlhas(geometry).filter((vertices) => vertices.length >= 12)
  if (ilhas.length < 2) return []

  meshOriginal.updateMatrix()

  const posAttr = geometry.getAttribute('position')
  const normalAttr = geometry.getAttribute('normal')
  const uvAttr = geometry.getAttribute('uv')
  const indexAttr = geometry.index
  const totalTriangulos = indexAttr ? indexAttr.count / 3 : posAttr.count / 3

  const p = new THREE.Vector3()
  const caixa = new THREE.Box3()
  const tamanho = new THREE.Vector3()
  const centro = new THREE.Vector3()

  return ilhas.map((vertices) => {
    const mapa = new Map()
    vertices.forEach((v, i) => mapa.set(v, i))

    caixa.makeEmpty()
    vertices.forEach((v) => caixa.expandByPoint(p.fromBufferAttribute(posAttr, v)))
    caixa.getCenter(centro)
    caixa.getSize(tamanho)

    const posicoes = new Float32Array(vertices.length * 3)
    const normais = normalAttr ? new Float32Array(vertices.length * 3) : null
    const uvs = uvAttr ? new Float32Array(vertices.length * 2) : null

    vertices.forEach((v, i) => {
      posicoes[i * 3] = posAttr.getX(v) - centro.x
      posicoes[i * 3 + 1] = posAttr.getY(v) - centro.y
      posicoes[i * 3 + 2] = posAttr.getZ(v) - centro.z
      if (normais) {
        normais[i * 3] = normalAttr.getX(v)
        normais[i * 3 + 1] = normalAttr.getY(v)
        normais[i * 3 + 2] = normalAttr.getZ(v)
      }
      if (uvs) {
        uvs[i * 2] = uvAttr.getX(v)
        uvs[i * 2 + 1] = uvAttr.getY(v)
      }
    })

    const indicesNovos = []
    for (let t = 0; t < totalTriangulos; t++) {
      const a = indexAttr ? indexAttr.getX(t * 3) : t * 3
      const b = indexAttr ? indexAttr.getX(t * 3 + 1) : t * 3 + 1
      const c = indexAttr ? indexAttr.getX(t * 3 + 2) : t * 3 + 2
      if (mapa.has(a)) indicesNovos.push(mapa.get(a), mapa.get(b), mapa.get(c))
    }

    const geometriaRoda = new THREE.BufferGeometry()
    geometriaRoda.setAttribute('position', new THREE.BufferAttribute(posicoes, 3))
    if (normais) geometriaRoda.setAttribute('normal', new THREE.BufferAttribute(normais, 3))
    if (uvs) geometriaRoda.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geometriaRoda.setIndex(indicesNovos)
    const dimensoes = [tamanho.x, tamanho.y, tamanho.z]
    const eixoGiro = ['x', 'y', 'z'][dimensoes.indexOf(Math.min(...dimensoes))]

    const roda = new THREE.Mesh(geometriaRoda, meshOriginal.material)
    roda.position.copy(centro).applyMatrix4(meshOriginal.matrix)
    roda.quaternion.copy(meshOriginal.quaternion)
    roda.scale.copy(meshOriginal.scale)
    roda.userData.eixoGiro = eixoGiro

    return roda
  })
}

function useRodasGirando(scene, nomesMateriais) {
  const rodasRef = useRef([])

  useEffect(() => {
    if (!scene || scene.userData.rodasSeparadas) return
    scene.userData.rodasSeparadas = true

    const meshesOriginais = []
    scene.traverse((filho) => {
      if (filho.isMesh && nomesMateriais.includes(filho.material?.name)) {
        meshesOriginais.push(filho)
      }
    })

    const rodas = []
    meshesOriginais.forEach((meshOriginal) => {
      const novasRodas = criarRodasIndependentes(meshOriginal)
      if (novasRodas.length === 0) return

      const pai = meshOriginal.parent
      novasRodas.forEach((roda) => pai.add(roda))
      pai.remove(meshOriginal)
      rodas.push(...novasRodas)
    })

    rodasRef.current = rodas
  }, [scene, nomesMateriais])

  useFrame((_, delta) => {
    rodasRef.current.forEach((roda) => {
      roda[`rotate${roda.userData.eixoGiro.toUpperCase()}`](VELOCIDADE_RODA * delta)
    })
  })
}

const ROTACAO_Y_CARRO = Math.PI

const ESCALA_CARRO = 0.55


const ROTACAO_Y_FERRARI = Math.PI
const ESCALA_FERRARI = 0.46

const ROTACAO_Y_REDBULL = Math.PI

const ROTACAO_X_REDBULL = -0.03
const ESCALA_REDBULL = 0.12

const ESCALA_HOVER_FOTO = 1.3

const ELEVACAO_INICIAL = Math.atan2(0.6, 6)
const ELEVACAO_FINAL = 1.2
const DISTANCIA_CAMERA = Math.hypot(6, 0.6)

const TOMBO_PISTA = 75
const ALTURA_PISTA = '145%'

const PISTA_CURVA = { meio: 0.4368, amplitude: 0.1533, comprimento: 0.6771, fase: 0.6 }

function gerarCaminhoPista() {
  const passos = 160
  const pontos = []
  for (let i = 0; i <= passos; i++) {
    const u = i / passos
    const altura =
      PISTA_CURVA.meio +
      PISTA_CURVA.amplitude *
        Math.sin((2 * Math.PI * (u - 0.5)) / PISTA_CURVA.comprimento + PISTA_CURVA.fase)
    // no SVG o y cresce pra baixo, por isso o (1 - altura)
    pontos.push(`${i === 0 ? 'M' : 'L'}${(u * 1000).toFixed(1)} ${((1 - altura) * 1000).toFixed(1)}`)
  }
  return pontos.join(' ')
}

const PISTA_CAMINHO = gerarCaminhoPista()

const CARROS_PISTA = {
  esquerda: { descer: '50.6%', guinada: 0.117 },
  centro: { descer: '29.2%', guinada: 0.248 },
  direita: { descer: '25.3%', guinada: -0.185 },
}
const PISTA_INICIO = 1.02
const PISTA_DURACAO = 0.7
const PISTA_PAUSA_FINAL = 0.15
const DURACAO_TOTAL = PISTA_INICIO + PISTA_DURACAO + PISTA_PAUSA_FINAL

const cena = {
  elevacao: ELEVACAO_INICIAL,
  guinada: { esquerda: 0, centro: 0, direita: 0 },
}

function CameraRig({ id }) {
  useFrame(({ camera }) => {
    const e = cena.elevacao
    const a = -cena.guinada[id]
    camera.position.set(
      Math.cos(e) * Math.cos(a) * DISTANCIA_CAMERA,
      Math.sin(e) * DISTANCIA_CAMERA,
      -Math.cos(e) * Math.sin(a) * DISTANCIA_CAMERA
    )
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Carro() {
  const { scene } = useGLTF('/3d/mclaren_mcl35m_light.glb')
  useRodasGirando(scene, MATERIAIS_RODA.mclaren)

  return (
    <Center>
      <primitive object={scene} scale={ESCALA_CARRO} rotation={[0, ROTACAO_Y_CARRO, 0]} />
    </Center>
  )
}

function Ferrari() {
  const { scene } = useGLTF('/3d/ferrari_f1_2019_light.glb')
  useRodasGirando(scene, MATERIAIS_RODA.ferrari)

  return (
    <Center>
      <primitive object={scene} scale={ESCALA_FERRARI} rotation={[0, ROTACAO_Y_FERRARI, 0]} />
    </Center>
  )
}

function RedBullCarro() {
  const { scene } = useGLTF('/3d/redbull_rb15_light.glb')
  useRodasGirando(scene, MATERIAIS_RODA.redbull)

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

const PILOTOS = [
  { foto: '/atletas/max.webp', bandeira: '/bandeiras/nl.svg', pais: 'Holanda', nome: 'MAX', sobrenome: 'VERSTAPPEN' },

  { foto: '/atletas/yuki.webp', bandeira: '/bandeiras/jp.svg', pais: 'Japão', nome: 'Yuki', sobrenome: 'Tsunoda' },

  { foto: '/atletas/nikola.webp', bandeira: '/bandeiras/bg.svg', pais: 'Bulgária', nome: 'Nikola', sobrenome: 'Tsolov' },

  { foto: '/atletas/arvid.webp', bandeira: '/bandeiras/gb.svg', pais: 'Reino Unido', nome: 'Arvid', sobrenome: 'Lindblad' },

  { foto: '/atletas/liam.webp', bandeira: '/bandeiras/nz.svg', pais: 'Nova Zelândia', nome: 'Liam', sobrenome: 'Lawson' },

  { foto: '/atletas/isack.webp', bandeira: '/bandeiras/fr.svg', pais: 'França', nome: 'Isack', sobrenome: 'Hadjar' },
]

function PilotoCard({ foto, bandeira, pais, nome, sobrenome }) {
  const pilotoRef = useRef(null)
  const fotoWrapRef = useRef(null)
  const imgRef = useRef(null)
  const nomeRef = useRef(null)

  const empurrarVizinhos = (ativar) => {
    const el = pilotoRef.current
    if (!el) return

    const empurraoBase = window.innerWidth * 0.03

    const empurrarDirecao = (irmaoInicial, sinal) => {
      let irmao = irmaoInicial
      let distancia = 1
      while (irmao) {
        const alvoX = ativar ? sinal * (empurraoBase / distancia) : 0
        gsap.to(irmao, { x: alvoX, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
        irmao = sinal > 0 ? irmao.nextElementSibling : irmao.previousElementSibling
        distancia += 1
      }
    }

    empurrarDirecao(el.nextElementSibling, 1)
    empurrarDirecao(el.previousElementSibling, -1)
  }

  const descerTextos = (ativar) => {
    const alturaFoto = fotoWrapRef.current?.offsetHeight ?? 0
    const y = ativar ? (alturaFoto * (ESCALA_HOVER_FOTO - 1)) / 2 + 8 : 0

    gsap.to(nomeRef.current, {
      y,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const aoEntrarMouse = () => {
    gsap.to(fotoWrapRef.current, {
      scale: ESCALA_HOVER_FOTO,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    gsap.to(imgRef.current, {
      filter: 'grayscale(0%) contrast(1.05)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    empurrarVizinhos(true)
    descerTextos(true)
  }

  const aoSairMouse = () => {
    gsap.to(fotoWrapRef.current, {
      scale: 1,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    gsap.to(imgRef.current, {
      filter: 'grayscale(100%) contrast(1.05)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    empurrarVizinhos(false)
    descerTextos(false)
  }

  return (
    <div ref={pilotoRef} className="piloto" onMouseEnter={aoEntrarMouse} onMouseLeave={aoSairMouse}>
      <div ref={fotoWrapRef} className="piloto-foto">
        <img ref={imgRef} className="piloto-foto-img" src={foto} alt={`${nome} ${sobrenome}`} />
        <img
          className="piloto-bandeira"
          src={bandeira}
          alt={`Bandeira: ${pais}`}
          title={pais}
        />
      </div>
      <div ref={nomeRef} className="piloto-nome">
        <span>{nome}</span>
        <span>{sobrenome}</span>
      </div>
    </div>
  )
}

function Corrida() {
  const corridaRef = useRef(null)
  const textoRef = useRef(null)
  const pilotosRef = useRef(null)
  const retanguloRef = useRef(null)

  useEffect(() => {
    if (!corridaRef.current || !textoRef.current) return

    const ctx = gsap.context(() => {
      const distanciaTexto = () => {
        const h2 = textoRef.current?.querySelector('h2')
        if (!h2) return 0
        return h2.scrollWidth / 2 + window.innerWidth / 2 + 60
      }

      const distanciaPilotos = () => window.innerWidth + 100

      const pilotoEls = pilotosRef.current
        ? gsap.utils.toArray(pilotosRef.current.querySelectorAll('.piloto'))
        : []

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: corridaRef.current,
          start: 'top top',
          end: `+=${Math.round(300 * DURACAO_TOTAL)}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl

        .fromTo(
          textoRef.current,
          { x: distanciaTexto },
          { x: () => -distanciaTexto(), ease: 'none', force3D: true, duration: 1 },
          0
        )

        .fromTo(textoRef.current, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.05 }, 0)
        .to(textoRef.current, { opacity: 0, ease: 'none', duration: 0.05 }, 0.95)

      const totalPilotos = pilotoEls.length
      const inicioFaixa = 0.08
      const fimFaixa = 0.85
      const espacoPorPiloto =
        totalPilotos > 1 ? (fimFaixa - inicioFaixa) / totalPilotos : fimFaixa - inicioFaixa

      const duracaoPiloto = espacoPorPiloto * 1.6

      pilotoEls.forEach((el, i) => {
        const foto = el.querySelector('.piloto-foto-img')
        const inicio = inicioFaixa + i * espacoPorPiloto
        const meio = inicio + duracaoPiloto * 0.5

        tl.fromTo(
          el,
          { x: distanciaPilotos, opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out', duration: duracaoPiloto },
          inicio
        )

        if (foto) {
          tl.fromTo(
            foto,
            { scale: 1, filter: 'grayscale(100%) contrast(1.05)' },
            {
              scale: 1.45,
              filter: 'grayscale(0%) contrast(1.05)',
              ease: 'power2.out',
              duration: duracaoPiloto * 0.5,
            },
            inicio
          ).to(
            foto,
            {
              scale: 1,
              filter: 'grayscale(100%) contrast(1.05)',
              ease: 'power2.in',
              duration: duracaoPiloto * 0.5,
            },
            meio
          )
        }
      })

      tl.to(
        pilotosRef.current,
        { x: () => distanciaPilotos(), opacity: 0, ease: 'power2.in', duration: 0.06 },
        0.94
      )

      const retangulo = retanguloRef.current
      const detalhesPista = gsap.utils.toArray(retangulo.querySelectorAll('.pista-detalhe'))
      gsap.set(retangulo, { transformOrigin: '50% 100%' })

      tl.fromTo(
        retangulo,
        { rotationX: 0, height: '48%' },
        {
          rotationX: TOMBO_PISTA,
          height: ALTURA_PISTA,
          ease: 'power2.inOut',
          force3D: true,
          duration: PISTA_DURACAO,
        },
        PISTA_INICIO
      )

      tl.fromTo(
        detalhesPista,
        { autoAlpha: 0 },
        { autoAlpha: 1, ease: 'none', duration: PISTA_DURACAO * 0.5 },
        PISTA_INICIO + PISTA_DURACAO * 0.35
      )

      tl.to(
        cena,
        { elevacao: ELEVACAO_FINAL, ease: 'power2.inOut', duration: PISTA_DURACAO },
        PISTA_INICIO
      )

      const seletoresCarros = {
        esquerda: '.carro-modelo',
        centro: '.carro-modelo-centro',
        direita: '.carro-modelo-direita',
      }

      Object.entries(seletoresCarros).forEach(([id, seletor]) => {
        const el = corridaRef.current.querySelector(seletor)
        if (!el) return

        tl.fromTo(
          el,
          { '--descer': '0%' },
          { '--descer': CARROS_PISTA[id].descer, ease: 'power2.inOut', duration: PISTA_DURACAO },
          PISTA_INICIO
        )
        tl.to(
          cena.guinada,
          { [id]: CARROS_PISTA[id].guinada, ease: 'power2.inOut', duration: PISTA_DURACAO },
          PISTA_INICIO
        )
      })

      // segura o resultado final um pouquinho antes de soltar a seção
      tl.to({}, { duration: PISTA_PAUSA_FINAL }, PISTA_INICIO + PISTA_DURACAO)
    }, corridaRef)

    return () => {
      ctx.revert()
      cena.elevacao = ELEVACAO_INICIAL
      cena.guinada.esquerda = 0
      cena.guinada.centro = 0
      cena.guinada.direita = 0
    }
  }, [])

  return (
    <section ref={corridaRef} className="corrida">
      <div ref={retanguloRef} className="retangulo">
        <div className="pista-detalhe pista-asfalto" />
        <svg
          className="pista-detalhe pista-svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="pista-kerb-branco" d={PISTA_CAMINHO} />
          <path className="pista-kerb-vermelho" d={PISTA_CAMINHO} />
          <path className="pista-rua" d={PISTA_CAMINHO} />
          <path className="pista-linha-central" d={PISTA_CAMINHO} />
        </svg>
      </div>

      <div ref={textoRef} className="texto-corrida">
        <h2>Na F1 voamos com nossas aaasas!!</h2>
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
          <CameraRig id="esquerda" />

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
          <CameraRig id="centro" />

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
          <CameraRig id="direita" />

          <Suspense fallback={null}>
            <RedBullCarro />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      <div ref={pilotosRef} className="pilotos">
        {PILOTOS.map((piloto, i) => (
          <PilotoCard key={i} {...piloto} />
        ))}
      </div>
    </section>
  )
}

export default Corrida

useGLTF.preload('/3d/mclaren_mcl35m_light.glb')
useGLTF.preload('/3d/ferrari_f1_2019_light.glb')
useGLTF.preload('/3d/redbull_rb15_light.glb')