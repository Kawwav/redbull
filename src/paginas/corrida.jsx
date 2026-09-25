import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Brasil from './brasil.jsx'
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
const PISTA_PAUSA_FINAL = 0.42
const CORTINA_DELAY = 0.1
const CORTINA_DURACAO = PISTA_PAUSA_FINAL - CORTINA_DELAY
const CORTINA_FIM = PISTA_INICIO + PISTA_DURACAO + PISTA_PAUSA_FINAL

const ESPACO_ZOOM_DURACAO = 0.75
const ESPACO_ZOOM_ESCALA = 2.6
const RESTO_FADE_FRACAO = 0.6

// estado "fora da tela" das 3 nuvens principais — usado tanto pra elas
// entrarem (do jeito que já era) quanto pra saírem por onde vieram
const NUVEM1_FORA = { yPercent: 140, opacity: 0 }
const NUVEM2_FORA = { xPercent: -140, opacity: 0 }
const NUVEM3_FORA = { yPercent: -140, opacity: 0 }

const NUVENS_EXTRA = [
  { src: '/imagens/nuvem1.webp', width: '24vw', maxWidth: '340px', minWidth: '56%', top: '-10%', left: '-10%', entrada: 'cima', atraso: 0.0 },
  { src: '/imagens/nuvem2.webp', width: '22vw', maxWidth: '300px', minWidth: '50%', top: '-14%', left: '34%', entrada: 'cima', atraso: 0.05 },
  { src: '/imagens/nuvem3.webp', width: '26vw', maxWidth: '360px', minWidth: '58%', top: '28%', right: '-10%', entrada: 'direita', atraso: 0.1 },
  { src: '/imagens/nuvem1.webp', width: '28vw', maxWidth: '380px', minWidth: '62%', bottom: '-12%', right: '-8%', entrada: 'baixo', atraso: 0.15 },
  { src: '/imagens/nuvem2.webp', width: '30vw', maxWidth: '400px', minWidth: '64%', bottom: '-14%', left: '32%', entrada: 'baixo', atraso: 0.2 },
  { src: '/imagens/nuvem3.webp', width: '24vw', maxWidth: '330px', minWidth: '54%', top: '30%', left: '24%', entrada: 'centro', atraso: 0.25 },
  { src: '/imagens/nuvem1.webp', width: '22vw', maxWidth: '300px', minWidth: '50%', top: '34%', left: '52%', entrada: 'centro', atraso: 0.3 },
  { src: '/imagens/nuvem2.webp', width: '20vw', maxWidth: '280px', minWidth: '46%', bottom: '6%', left: '2%', entrada: 'esquerda', atraso: 0.35 },

  { src: '/imagens/nuvem1.webp', width: '28vw', maxWidth: '380px', minWidth: '60%', bottom: '-18%', left: '-18%', entrada: 'baixo-esquerda', atraso: 0.4 },
  { src: '/imagens/nuvem2.webp', width: '22vw', maxWidth: '300px', minWidth: '50%', bottom: '-8%', left: '-4%', entrada: 'baixo-esquerda', atraso: 0.44 },
  { src: '/imagens/nuvem3.webp', width: '32vw', maxWidth: '420px', minWidth: '68%', bottom: '-22%', left: '4%', entrada: 'baixo-esquerda', atraso: 0.48 },
  { src: '/imagens/nuvem1.webp', width: '20vw', maxWidth: '270px', minWidth: '44%', bottom: '2%', left: '-10%', entrada: 'baixo-esquerda', atraso: 0.52 },
  { src: '/imagens/nuvem2.webp', width: '25vw', maxWidth: '340px', minWidth: '54%', bottom: '-10%', left: '16%', entrada: 'baixo-esquerda', atraso: 0.56 },

  { src: '/imagens/nuvem3.webp', width: '30vw', maxWidth: '400px', minWidth: '64%', top: '-16%', left: '-4%', entrada: 'cima', atraso: 0.06 },
  { src: '/imagens/nuvem1.webp', width: '28vw', maxWidth: '380px', minWidth: '60%', top: '-18%', left: '20%', entrada: 'cima', atraso: 0.1 },
  { src: '/imagens/nuvem2.webp', width: '26vw', maxWidth: '360px', minWidth: '58%', top: '-12%', left: '46%', entrada: 'cima', atraso: 0.14 },
  { src: '/imagens/nuvem3.webp', width: '28vw', maxWidth: '380px', minWidth: '60%', top: '-18%', left: '68%', entrada: 'cima', atraso: 0.18 },
  { src: '/imagens/nuvem1.webp', width: '26vw', maxWidth: '360px', minWidth: '56%', top: '-14%', right: '-10%', entrada: 'cima', atraso: 0.22 },
  { src: '/imagens/nuvem2.webp', width: '22vw', maxWidth: '300px', minWidth: '48%', top: '2%', left: '8%', entrada: 'cima', atraso: 0.26 },
  { src: '/imagens/nuvem3.webp', width: '20vw', maxWidth: '280px', minWidth: '44%', top: '4%', left: '58%', entrada: 'cima', atraso: 0.3 },
]

// maior atraso entre todas as nuvens, usado pra garantir que sobre scroll
// suficiente no pin pra última nuvem terminar de entrar (ou de sair)
const NUVENS_ATRASO_MAX = Math.max(0.2, ...NUVENS_EXTRA.map((n) => n.atraso))

// devolve o estado "fora da tela" (de onde ela vem/pra onde ela volta) e o
// estado "no lugar" de uma nuvem extra, a partir da direção de entrada dela.
// usada tanto na entrada quanto na saída (saída = voltar pro estadoInicial)
function estadosNuvemExtra(entrada) {
  const estadoInicial =
    entrada === 'cima'
      ? { yPercent: -140, opacity: 0 }
      : entrada === 'baixo'
        ? { yPercent: 140, opacity: 0 }
        : entrada === 'esquerda'
          ? { xPercent: -140, opacity: 0 }
          : entrada === 'direita'
            ? { xPercent: 140, opacity: 0 }
            : entrada === 'baixo-esquerda'
              ? { xPercent: -140, yPercent: 140, opacity: 0 }
              : { scale: 0.55, opacity: 0 }

  const estadoFinal =
    entrada === 'cima' || entrada === 'baixo'
      ? { yPercent: 0, opacity: 1 }
      : entrada === 'esquerda' || entrada === 'direita'
        ? { xPercent: 0, opacity: 1 }
        : entrada === 'baixo-esquerda'
          ? { xPercent: 0, yPercent: 0, opacity: 1 }
          : { scale: 1, opacity: 1 }

  return { estadoInicial, estadoFinal }
}

// fim da entrada das nuvens: tela 100% coberta, é a deixa pra terra sumir e
// o brasil.jsx aparecer por trás, sem o público perceber a troca
const NUVENS_FIM = CORTINA_FIM + ESPACO_ZOOM_DURACAO * (1 + NUVENS_ATRASO_MAX)

const BRASIL_TRANSICAO_DURACAO = 0.3

// nuvens saem pelas mesmas direções e com os mesmos atrasos relativos que
// entraram — só que a cortina (terra + nuvens + brasil) continua na escala
// do zoom, ninguém "desfaz" o zoom aqui
const NUVENS_SAIDA_INICIO = NUVENS_FIM + BRASIL_TRANSICAO_DURACAO
const NUVENS_SAIDA_DURACAO = ESPACO_ZOOM_DURACAO

const DURACAO_TOTAL = NUVENS_SAIDA_INICIO + NUVENS_SAIDA_DURACAO * (1 + NUVENS_ATRASO_MAX)

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
  const cortinaRef = useRef(null)
  const terraRef = useRef(null)
  const nuvem1Ref = useRef(null)
  const nuvem2Ref = useRef(null)
  const nuvem3Ref = useRef(null)
  const restoRef = useRef(null)
  const nuvensExtraRef = useRef([])
  nuvensExtraRef.current = []
  const brasilRef = useRef(null)

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

      gsap.set(cortinaRef.current, { xPercent: 100 })
      tl.fromTo(
        cortinaRef.current,
        { xPercent: 100 },
        { xPercent: 0, ease: 'sine.inOut', duration: CORTINA_DURACAO },
        PISTA_INICIO + PISTA_DURACAO + CORTINA_DELAY
      )

      gsap.set(cortinaRef.current, { transformOrigin: '8% 72%' })
      gsap.set(nuvem1Ref.current, NUVEM1_FORA)
      gsap.set(nuvem2Ref.current, NUVEM2_FORA)
      gsap.set(nuvem3Ref.current, NUVEM3_FORA)

      // o .corrida-cortina ganha scale(ESPACO_ZOOM_ESCALA) logo abaixo e esse
      // zoom nunca é desfeito. como o brasil.jsx é filho dessa mesma div, ele
      // herdaria o zoom junto — aqui aplicamos o contra-zoom exato (mesmo
      // transform-origin do pai, escala inversa) pra ele ficar sempre no
      // tamanho normal, sem depender de nenhum ajuste manual de posição
      gsap.set(brasilRef.current, {
        opacity: 0,
        scale: 1 / ESPACO_ZOOM_ESCALA,
        transformOrigin: '8% 72%',
      })

      tl.to(
        cortinaRef.current,
        { scale: ESPACO_ZOOM_ESCALA, ease: 'power1.inOut', duration: ESPACO_ZOOM_DURACAO },
        CORTINA_FIM
      )

      tl.to(
        restoRef.current,
        { opacity: 0, ease: 'power1.in', duration: ESPACO_ZOOM_DURACAO * RESTO_FADE_FRACAO },
        CORTINA_FIM
      )

      tl.to(
        nuvem1Ref.current,
        { yPercent: 0, opacity: 1, ease: 'sine.inOut', duration: ESPACO_ZOOM_DURACAO },
        CORTINA_FIM
      )

      tl.to(
        nuvem2Ref.current,
        { xPercent: 0, opacity: 1, ease: 'sine.inOut', duration: ESPACO_ZOOM_DURACAO },
        CORTINA_FIM + ESPACO_ZOOM_DURACAO * 0.1
      )

      tl.to(
        nuvem3Ref.current,
        { yPercent: 0, opacity: 1, ease: 'sine.inOut', duration: ESPACO_ZOOM_DURACAO },
        CORTINA_FIM + ESPACO_ZOOM_DURACAO * 0.2
      )

      // nuvens extras: cada uma entra de um lado (ou só some/aparece, se
      // for uma nuvem "de meio") pra fechar qualquer vão que sobrar
      NUVENS_EXTRA.forEach((nuvem, i) => {
        const el = nuvensExtraRef.current[i]
        if (!el) return

        const { estadoInicial, estadoFinal } = estadosNuvemExtra(nuvem.entrada)

        gsap.set(el, estadoInicial)
        tl.to(
          el,
          { ...estadoFinal, ease: 'sine.inOut', duration: ESPACO_ZOOM_DURACAO },
          CORTINA_FIM + ESPACO_ZOOM_DURACAO * nuvem.atraso
        )
      })

      // --- tela 100% coberta de nuvem: a terra some e o brasil.jsx aparece
      // por trás, tudo escondido atrás das nuvens ---
      tl.to(
        terraRef.current,
        { opacity: 0, ease: 'none', duration: BRASIL_TRANSICAO_DURACAO },
        NUVENS_FIM
      )
      tl.fromTo(
        brasilRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'none', duration: BRASIL_TRANSICAO_DURACAO },
        NUVENS_FIM
      )

      // --- nuvens saem pelo mesmo caminho por onde vieram, revelando o
      // brasil.jsx. a cortina continua na escala do zoom (ESPACO_ZOOM_ESCALA)
      // o tempo todo — ninguém dá "unzoom" aqui, elas só voltam pro lugar
      // de onde entraram, no tamanho em que estão ---
      tl.to(
        nuvem1Ref.current,
        { ...NUVEM1_FORA, ease: 'sine.inOut', duration: NUVENS_SAIDA_DURACAO },
        NUVENS_SAIDA_INICIO
      )
      tl.to(
        nuvem2Ref.current,
        { ...NUVEM2_FORA, ease: 'sine.inOut', duration: NUVENS_SAIDA_DURACAO },
        NUVENS_SAIDA_INICIO + NUVENS_SAIDA_DURACAO * 0.1
      )
      tl.to(
        nuvem3Ref.current,
        { ...NUVEM3_FORA, ease: 'sine.inOut', duration: NUVENS_SAIDA_DURACAO },
        NUVENS_SAIDA_INICIO + NUVENS_SAIDA_DURACAO * 0.2
      )

      NUVENS_EXTRA.forEach((nuvem, i) => {
        const el = nuvensExtraRef.current[i]
        if (!el) return

        const { estadoInicial } = estadosNuvemExtra(nuvem.entrada)

        tl.to(
          el,
          { ...estadoInicial, ease: 'sine.inOut', duration: NUVENS_SAIDA_DURACAO },
          NUVENS_SAIDA_INICIO + NUVENS_SAIDA_DURACAO * nuvem.atraso
        )
      })
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

      <div ref={cortinaRef} className="corrida-cortina">
        <Brasil brasilRef={brasilRef} />

        <img ref={terraRef} className="cortina-imagem cortina-terra" src="/espaço/terra.webp" alt="Terra" />
        <img ref={nuvem1Ref} className="cortina-imagem cortina-nuvem1" src="/imagens/nuvem1.webp" alt="Nuvem" />
        <img ref={nuvem2Ref} className="cortina-imagem cortina-nuvem2" src="/imagens/nuvem2.webp" alt="Nuvem" />
        <img ref={nuvem3Ref} className="cortina-imagem cortina-nuvem3" src="/imagens/nuvem3.webp" alt="Nuvem" />

        {NUVENS_EXTRA.map((nuvem, i) => (
          <img
            key={i}
            ref={(el) => {
              nuvensExtraRef.current[i] = el
            }}
            className="cortina-imagem cortina-nuvem-extra"
            src={nuvem.src}
            alt="Nuvem"
            style={{
              width: nuvem.width,
              maxWidth: nuvem.maxWidth,
              minWidth: nuvem.minWidth,
              top: nuvem.top,
              left: nuvem.left,
              right: nuvem.right,
              bottom: nuvem.bottom,
            }}
          />
        ))}

        <div ref={restoRef} className="cortina-resto">
          <img className="cortina-imagem cortina-lua" src="/espaço/lua.webp" alt="Lua" />
          <img className="cortina-imagem cortina-nave" src="/espaço/nave.webp" alt="Nave" />
          <img className="cortina-imagem cortina-pessoa" src="/espaço/pessoa.webp" alt="Pessoa" />
          <h2>AS VEZES A GENTE DA <br />AAASAS DEMAIS</h2>
          <p className="cortina-citacao">
            “Quando se está no topo do mundo, você não pensa mais em recordes, tudo o você que pensa é que você quer voltar vivo”
            <span>— Felix Baumgartner</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Corrida

useGLTF.preload('/3d/mclaren_mcl35m_light.glb')
useGLTF.preload('/3d/ferrari_f1_2019_light.glb')
useGLTF.preload('/3d/redbull_rb15_light.glb')