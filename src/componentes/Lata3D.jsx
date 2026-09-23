import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import './Lata3D.css'

const INCLINACAO_X = 0.25
const INCLINACAO_Z = 0.35

const ROTACAO_Y_FRENTE = Math.PI
const ROTACAO_Y_INICIAL = ROTACAO_Y_FRENTE + Math.PI / 3 + Math.PI * 2

const ESCALA_INICIAL = 5
const ESCALA_FINAL = 7.5

const POSICAO_Y_FINAL = -0.4

// balanço contínuo e sutil da lata, sempre ligado
const AMPLITUDE_BALANCO_LATA_X = 0.035
const AMPLITUDE_BALANCO_LATA_Y = 0.05
const AMPLITUDE_BALANCO_LATA_Z = 0.03
const VELOCIDADE_BALANCO_LATA_X = 0.55
const VELOCIDADE_BALANCO_LATA_Y = 0.37
const VELOCIDADE_BALANCO_LATA_Z = 0.71

const AMPLITUDE_FLUTUACAO_LATA_Y = 0.025
const AMPLITUDE_FLUTUACAO_LATA_X = 0.015
const VELOCIDADE_FLUTUACAO_LATA_Y = 0.48
const VELOCIDADE_FLUTUACAO_LATA_X = 0.33

// mortal
const LIMIAR_INICIO_MORTAL_COMECO = 0.92 // só nos últimos 8% do scroll da comeco
const PESO_MORTAL_COMECO = 0.25 // fração do giro que acontece ainda dentro da comeco
const LIMIAR_FIM_MORTAL_ENERGETICOS = 0.4 // o resto do giro se completa até 40% do scroll da energeticos
const VOLTAS_MORTAL = 1 // 1 volta completa = um mortal
const SENTIDO_MORTAL = -1 // -1 = mortal "pra trás", 1 = "pra frente"
const SUAVIDADE_MORTAL = 0.028 // quanto menor, mais suave/lento e "de vagar" o giro
const SUAVIDADE_QUEDA_POSICAO = 0.045
const SUAVIDADE_QUEDA_ESCALA = 0.06
const SUAVIDADE_POUSO_SUMIR = 0.025 // bem mais lenta: dá aquele "delay" suave depois que ela pousa/afunda/some (e volta assim também)
const ESCALA_POUSO_NO_QUADRO = 6.2 // escala final da lata já "dentro" do quadro — maior que a caixa de propósito, pra "vazar" um pouco pra fora
const OFFSET_Y_POUSO = -0.19 // desloca a lata pra baixo no ponto final (dentro do quadro-menu)
const LIMIAR_TRAVAR_POUSO = 0.97 // a partir daqui a lata "trava" exatamente no alvo, sem escapar do quadro
const INCLINACAO_POUSO_X = 0.16 // inclinação diagonal (eixo x) aplicada só no pouso, dentro do quadro
const INCLINACAO_POUSO_Z = -0.4 // inclinação diagonal (eixo z) aplicada só no pouso, dentro do quadro
const AFUNDAMENTO_SUMIR = 2.8 // o quanto a lata desce (eixo y) enquanto some, na 2ª fase da energeticos
const PLANO_PROFUNDIDADE_QUEDA = 0

// agora o avião aparece logo no início do scroll da comeco e fica orbitando
// a lata o tempo todo enquanto estivermos nessa seção (some só ao entrar na energeticos)
const INICIO_FADE_AVIAO = 0.05 // a partir de quantos % do scroll da comeco ele começa a aparecer
const FIM_FADE_AVIAO = 0.2 // com quantos % do scroll ele já está 100% visível/orbitando

const ESCALA_AVIAO = 0.2

const RAIO_ORBITA_AVIAO = 1.0
const ALTURA_ORBITA_AVIAO = 0.5
const VELOCIDADE_ORBITA_AVIAO = 0.55

const AMPLITUDE_SUBIDA_DESCIDA_AVIAO = 0.3
const FREQUENCIA_SUBIDA_DESCIDA_AVIAO = 1

const BALANCO_BASE_AVIAO = -0.3

const AMPLITUDE_BALANCO_AVIAO = 0.06
const FREQUENCIA_BALANCO_AVIAO = 1.2

const INCLINACAO_VERTICAL_AVIAO = 0.35

const OFFSET_ROTACAO_AVIAO = Math.PI / 2

// eixo local em que a hélice gira (nariz do avião no X negativo)
const EIXO_ROTACAO_HELICE = 'x'
const VELOCIDADE_ROTACAO_HELICE = 18 // rad/s

// usados só no fallback, quando o .glb não tem a hélice separada
const HELICE_FALLBACK_POSICAO = [-0.82, 0, 0]
const HELICE_FALLBACK_TAMANHO = 0.22

const QUEDA_CAN2_Y_INICIAL = POSICAO_Y_FINAL + 4.5 // começa bem acima da tela, fora de vista
const OFFSET_Y_CAN2 = 0.37 // ajusta a altura final dela (positivo = mais pra cima); mexa aqui até encaixar no quadrado do meio
const ROTACAO_Y_CAN2 = 0 // "frente" do modelo can_2 — ajuste até ficar de frente pra câmera
const LIMIAR_INICIO_QUEDA_CAN2 = 0.5 // só começa a cair depois que a lata 1 já percorreu metade do caminho — evita as duas se cruzarem no meio da tela
const SUAVIDADE_QUEDA_CAN2_POSICAO = 0.05
const SUAVIDADE_QUEDA_CAN2_ESCALA = 0.06
// o modelo can_2_blue.glb tem um "tamanho nativo" diferente do can_1 — esse
// fator corrige isso pra ela ficar do mesmo tamanho visual que a lata 1.
// diminua se ainda estiver maior, aumente se ficar menor que a lata 1
const FATOR_ESCALA_CAN2 = 0.6
const ESCALA_FINAL_CAN2 = ESCALA_FINAL * FATOR_ESCALA_CAN2

// hover no quadro-menu (só depois que o can_2 já pousou lá dentro): dá uma
// volta completa em Y e termina "torta" numa inclinação diagonal (X + Z)
const VOLTA_HOVER_CAN2 = Math.PI * 2 // 360°
const INCLINACAO_TORTA_X_CAN2 = 0.32
const INCLINACAO_TORTA_Z_CAN2 = -0.4
const DURACAO_GIRO_HOVER_CAN2 = 0.9

// --- can_3 (verde) e can_4 (pêssego): vivem dentro dos 2 quadrados
// secundários (esquerda/direita) que só aparecem na fase 2 do scroll da
// energeticos (revelacaoProgressRef), acompanhando a posição deles na tela ---
const ESCALA_LATERAL_BASE = 4.2 // escala "de referência" das latas laterais
const FATOR_ESCALA_CAN3 = 1 // ajuste até o can_3_green.glb ficar do tamanho visual desejado
const FATOR_ESCALA_CAN4 = 1 // idem, pro can_4_peach.glb
const ESCALA_FINAL_CAN3 = ESCALA_LATERAL_BASE * FATOR_ESCALA_CAN3
const ESCALA_FINAL_CAN4 = ESCALA_LATERAL_BASE * FATOR_ESCALA_CAN4

const ROTACAO_Y_CAN3 = 0 // "frente" do can_3 — ajuste até ficar de frente pra câmera
const ROTACAO_Y_CAN4 = 0 // idem, pro can_4

const OFFSET_Y_CAN3 = 0 // ajuste fino de altura dentro do quadrado esquerdo
const OFFSET_Y_CAN4 = 0 // ajuste fino de altura dentro do quadrado direito

// segue o quadrado (que já está se movendo via GSAP) com uma leve suavização
const SUAVIDADE_LATERAL_POSICAO = 0.08
const SUAVIDADE_LATERAL_ESCALA = 0.07

const AMPLITUDE_FLUTUACAO_LATERAL_Y = 0.04
const VELOCIDADE_FLUTUACAO_LATERAL_Y = 0.6

// hover nos quadros secundários (esquerda/direita) — mesma animação do hover
// do quadro-menu central: uma volta completa em Y e termina torta (X + Z)
const VOLTA_HOVER_LATERAL = Math.PI * 2 // 360°
const INCLINACAO_TORTA_X_LATERAL = 0.32
const INCLINACAO_TORTA_Z_LATERAL = -0.4
const DURACAO_GIRO_HOVER_LATERAL = 0.9

// fração da LARGURA DO PRÓPRIO QUADRADO usada como deslocamento de entrada da
// lata lateral: 0 = nasce já centralizada (sem deslizar), ~0.5 = nasce bem na
// borda do quadrado, do seu próprio lado, e desliza de lá pra dentro — assim
// a entrada fica contida dentro/perto do quadrado, não vindo de fora da tela
const FRACAO_ENTRADA_LATERAL = 0.45

// projeta o centro (em tela) de um elemento HTML qualquer pro mesmo plano 3D
// em que as latas vivem — versão genérica de obterPosicaoAlvoQueda, usada
// pelas latas laterais (que seguem os quadros secundários, não o quadro-menu)
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

// mede a largura (em unidades 3D, no mesmo plano das latas) de um elemento
// HTML qualquer, projetando a borda esquerda e a borda direita dele — usada
// só pra calibrar o deslocamento de entrada das latas laterais, em vez de um
// valor fixo "no chute" que não bate com o tamanho real do quadrado na tela
function obterLarguraElementoNoMundo(elementoRef, camera, size, raycaster, plano, vetorAuxiliar) {
  const elemento = elementoRef?.current
  if (!elemento || !camera || !size) return null

  const retangulo = elemento.getBoundingClientRect()
  if (retangulo.width === 0 && retangulo.height === 0) return null

  const centroY = retangulo.top + retangulo.height / 2
  const ndcY = -(centroY / size.height) * 2 + 1

  const ndcXEsquerdo = (retangulo.left / size.width) * 2 - 1
  raycaster.setFromCamera({ x: ndcXEsquerdo, y: ndcY }, camera)
  if (!raycaster.ray.intersectPlane(plano, vetorAuxiliar)) return null
  const xEsquerdo = vetorAuxiliar.x

  const ndcXDireito = (retangulo.right / size.width) * 2 - 1
  raycaster.setFromCamera({ x: ndcXDireito, y: ndcY }, camera)
  if (!raycaster.ray.intersectPlane(plano, vetorAuxiliar)) return null
  const xDireito = vetorAuxiliar.x

  return Math.abs(xDireito - xEsquerdo)
}

function Lata({ mouseRef, scrollProgressRef, energeticosProgressRef, revelacaoProgressRef, quadroRef }) {
  const { scene } = useGLTF('/3d/can_1_original.glb')
  const grupoRef = useRef(null)
  const balancoRef = useRef(null)
  const mortalRef = useRef(null)
  const primitiveRef = useRef(null)

  // raycaster + plano reaproveitados a cada frame pra não recriar objetos no loop
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const planoQueda = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANO_PROFUNDIDADE_QUEDA),
    []
  )
  const alvoQueda = useMemo(() => new THREE.Vector3(), [])

  // converte o centro do .quadro-menu (posição na tela, em px) pra um ponto 3D
  // no mesmo plano de profundidade em que a lata vive
  const obterPosicaoAlvoQueda = (camera, size) => {
    const elemento = quadroRef?.current
    if (!elemento || !camera || !size) return null

    const retangulo = elemento.getBoundingClientRect()
    if (retangulo.width === 0 && retangulo.height === 0) return null

    const centroX = retangulo.left + retangulo.width / 2
    const centroY = retangulo.top + retangulo.height / 2

    const ndcX = (centroX / size.width) * 2 - 1
    const ndcY = -(centroY / size.height) * 2 + 1

    raycaster.setFromCamera({ x: ndcX, y: ndcY }, camera)
    const encontrou = raycaster.ray.intersectPlane(planoQueda, alvoQueda)

    return encontrou ? alvoQueda : null
  }

  useEffect(() => {
    if (!grupoRef.current) return

    grupoRef.current.rotation.x = INCLINACAO_X
    grupoRef.current.rotation.y = ROTACAO_Y_INICIAL
    grupoRef.current.rotation.z = INCLINACAO_Z

    // nasce de baixo pra cima
    gsap.fromTo(
      grupoRef.current.position,
      { y: -2.4 },
      { y: POSICAO_Y_FINAL, duration: 1.4, ease: 'power3.out' }
    )
  }, [])

  useFrame((state) => {
    if (!grupoRef.current) return

    const progresso = scrollProgressRef?.current ?? 0
    // 0 -> 1 durante o scroll pinado da seção energeticos, ou seja, exatamente
    // o trecho "entre" a página comeco (já concluída) e a energeticos se revelando
    const progressoQueda = energeticosProgressRef?.current ?? 0
    // 0 -> 1 na 2ª fase da energeticos (depois que a lata já pousou): textos saem
    // pros lados, a lata afunda e some, e os quadrados secundários se revelam
    const progressoSumir = revelacaoProgressRef?.current ?? 0
    const { x, y } = mouseRef.current

    // progresso do mortal (0 -> 1): uma parte pequena acontece ainda no fim do
    // scroll da "comeco" (faseComeco), o resto se completa logo no começo do
    // scroll da "energeticos" (faseEnergeticos) — a transição entre as duas é
    // contínua, então o giro acontece exatamente "atravessando" as duas seções
    const faseComeco = Math.min(
      1,
      Math.max(0, (progresso - LIMIAR_INICIO_MORTAL_COMECO) / (1 - LIMIAR_INICIO_MORTAL_COMECO))
    )
    const faseEnergeticos = Math.min(1, Math.max(0, progressoQueda / LIMIAR_FIM_MORTAL_ENERGETICOS))
    const progressoMortal =
      faseComeco * PESO_MORTAL_COMECO + faseEnergeticos * (1 - PESO_MORTAL_COMECO)

    // o mouse agora inclina a lata o tempo todo, em qualquer momento (comeco,
    // mortal, queda, já pousada) — some com o amortecimento anterior
    const influenciaMouse = 1

    const baseX = gsap.utils.interpolate(INCLINACAO_X, 0, progresso)
    const baseY = gsap.utils.interpolate(ROTACAO_Y_INICIAL, ROTACAO_Y_FRENTE, progresso)
    const baseZ = gsap.utils.interpolate(INCLINACAO_Z, 0, progresso)

    const alvoX = baseX - y * 0.3 * influenciaMouse + INCLINACAO_POUSO_X * progressoQueda
    const alvoY = baseY + x * 0.5 * influenciaMouse
    const alvoZ = baseZ + x * 0.15 * influenciaMouse + INCLINACAO_POUSO_Z * progressoQueda

    grupoRef.current.rotation.x += (alvoX - grupoRef.current.rotation.x) * 0.05
    grupoRef.current.rotation.y += (alvoY - grupoRef.current.rotation.y) * 0.05
    grupoRef.current.rotation.z += (alvoZ - grupoRef.current.rotation.z) * 0.05

    // --- mortal: uma volta completa em X, por cima da rotação "base" acima ---
    if (mortalRef.current) {
      const rotacaoAlvoMortal = progressoMortal * Math.PI * 2 * VOLTAS_MORTAL * SENTIDO_MORTAL
      mortalRef.current.rotation.x +=
        (rotacaoAlvoMortal - mortalRef.current.rotation.x) * SUAVIDADE_MORTAL
    }

    // --- queda: a lata desliza da posição de repouso até o centro do .quadro-menu ---
    if (progressoQueda > 0) {
      const alvo = obterPosicaoAlvoQueda(state.camera, state.size)
      if (alvo) {
        const posicaoAlvoX = gsap.utils.interpolate(0, alvo.x, progressoQueda)
        const posicaoAlvoYPouso = gsap.utils.interpolate(
          POSICAO_Y_FINAL,
          alvo.y + OFFSET_Y_POUSO,
          progressoQueda
        )
        // depois de pousada, na 2ª fase ela continua descendo até sumir de vez
        const posicaoAlvoY = posicaoAlvoYPouso - AFUNDAMENTO_SUMIR * progressoSumir

        if (progressoQueda >= LIMIAR_TRAVAR_POUSO) {
          // já pousou (inclusive durante o afundamento/sumiço): segue o alvo
          // com bastante suavidade/delay, tanto indo quanto voltando com o scroll
          grupoRef.current.position.x +=
            (posicaoAlvoX - grupoRef.current.position.x) * SUAVIDADE_POUSO_SUMIR
          grupoRef.current.position.y +=
            (posicaoAlvoY - grupoRef.current.position.y) * SUAVIDADE_POUSO_SUMIR
        } else {
          grupoRef.current.position.x +=
            (posicaoAlvoX - grupoRef.current.position.x) * SUAVIDADE_QUEDA_POSICAO
          grupoRef.current.position.y +=
            (posicaoAlvoY - grupoRef.current.position.y) * SUAVIDADE_QUEDA_POSICAO
        }
      }
    } else {
      // garante que, se o usuário voltar o scroll, a lata retorna suavemente ao centro
      grupoRef.current.position.x += (0 - grupoRef.current.position.x) * SUAVIDADE_QUEDA_POSICAO
      grupoRef.current.position.y +=
        (POSICAO_Y_FINAL - grupoRef.current.position.y) * SUAVIDADE_QUEDA_POSICAO
    }

    if (primitiveRef.current) {
      const escalaComeco = gsap.utils.interpolate(ESCALA_INICIAL, ESCALA_FINAL, progresso)
      const escalaAlvoPouso = gsap.utils.interpolate(escalaComeco, ESCALA_POUSO_NO_QUADRO, progressoQueda)
      // na 2ª fase, além de descer, ela encolhe até sumir de vez
      const escalaAlvo = gsap.utils.interpolate(escalaAlvoPouso, 0, progressoSumir)

      if (progressoQueda >= LIMIAR_TRAVAR_POUSO) {
        const escalaAtual = primitiveRef.current.scale.x
        const novaEscala = escalaAtual + (escalaAlvo - escalaAtual) * SUAVIDADE_POUSO_SUMIR
        primitiveRef.current.scale.setScalar(novaEscala)
      } else {
        const escalaAtual = primitiveRef.current.scale.x
        const novaEscala =
          escalaAtual +
          (escalaAlvo - escalaAtual) *
            (progressoQueda > 0 ? SUAVIDADE_QUEDA_ESCALA : 0.08)
        primitiveRef.current.scale.setScalar(novaEscala)
      }
    }

    if (balancoRef.current) {
      const tempo = state.clock.getElapsedTime()
      // o balanço ambiente diminui enquanto o mortal ou a queda acontecem, pra não tremer o giro
      const amortecimentoBalanco = 1 - Math.max(progressoMortal, progressoQueda) * 0.85

      balancoRef.current.rotation.x =
        Math.sin(tempo * VELOCIDADE_BALANCO_LATA_X) * AMPLITUDE_BALANCO_LATA_X * amortecimentoBalanco
      balancoRef.current.rotation.y =
        Math.sin(tempo * VELOCIDADE_BALANCO_LATA_Y + 1.1) *
        AMPLITUDE_BALANCO_LATA_Y *
        amortecimentoBalanco
      balancoRef.current.rotation.z =
        Math.sin(tempo * VELOCIDADE_BALANCO_LATA_Z + 2.4) *
        AMPLITUDE_BALANCO_LATA_Z *
        amortecimentoBalanco

      balancoRef.current.position.y =
        Math.sin(tempo * VELOCIDADE_FLUTUACAO_LATA_Y + 0.6) *
        AMPLITUDE_FLUTUACAO_LATA_Y *
        amortecimentoBalanco
      balancoRef.current.position.x =
        Math.sin(tempo * VELOCIDADE_FLUTUACAO_LATA_X + 3.0) *
        AMPLITUDE_FLUTUACAO_LATA_X *
        amortecimentoBalanco
    }
  })

  return (
    <group ref={grupoRef}>
      <group ref={balancoRef}>
        <group ref={mortalRef}>
          <Center>
            <primitive ref={primitiveRef} object={scene} scale={ESCALA_INICIAL} />
          </Center>
        </group>
      </group>
    </group>
  )
}

// aparece perto do fim do scroll e orbita a lata continuamente
function Aviao({ scrollProgressRef, energeticosProgressRef }) {
  const { scene } = useGLTF('/3d/aviao.glb')
  const grupoRef = useRef(null)
  const primitiveRef = useRef(null)
  const materiaisRef = useRef([])
  const helicesRef = useRef([])
  const fallbackHeliceRef = useRef(null)
  const [temHeliceNoModelo, setTemHeliceNoModelo] = useState(false)

  useEffect(() => {
    materiaisRef.current = []
    helicesRef.current = []

    scene.traverse((filho) => {
      if (filho.isMesh && filho.material) {
        filho.material = filho.material.clone()
        filho.material.transparent = true
        filho.material.opacity = 0
        materiaisRef.current.push(filho.material)
      }

      // só encontra algo se a hélice vier como peça separada no .glb
      if (/helic|propel|rotor|blade/i.test(filho.name)) {
        helicesRef.current.push(filho)
      }
    })

    setTemHeliceNoModelo(helicesRef.current.length > 0)
  }, [scene])

  useFrame((state, delta) => {
    if (!grupoRef.current || !primitiveRef.current) return

    const progresso = scrollProgressRef?.current ?? 0
    const progressoEnergeticos = energeticosProgressRef?.current ?? 0

    const bruto = (progresso - INICIO_FADE_AVIAO) / (FIM_FADE_AVIAO - INICIO_FADE_AVIAO)
    // assim que entramos na "energeticos" (progressoEnergeticos > 0), o avião
    // já não deve mais aparecer — sem depender do quanto a lata já pousou
    const emEnergeticos = progressoEnergeticos > 0
    const t = emEnergeticos ? 0 : Math.min(1, Math.max(0, bruto))

    const escalaAlvo = t > 0 ? ESCALA_AVIAO : 0
    const escalaAtual = primitiveRef.current.scale.x
    const novaEscala = escalaAtual + (escalaAlvo - escalaAtual) * 0.08
    primitiveRef.current.scale.setScalar(novaEscala)

    materiaisRef.current.forEach((mat) => {
      mat.opacity += (t - mat.opacity) * 0.08
    })

    const angulo = state.clock.getElapsedTime() * VELOCIDADE_ORBITA_AVIAO
    const oscilacaoVertical = Math.sin(angulo * FREQUENCIA_SUBIDA_DESCIDA_AVIAO)

    grupoRef.current.position.x = Math.cos(angulo) * RAIO_ORBITA_AVIAO
    grupoRef.current.position.z = Math.sin(angulo) * RAIO_ORBITA_AVIAO
    grupoRef.current.position.y =
      POSICAO_Y_FINAL + ALTURA_ORBITA_AVIAO + oscilacaoVertical * AMPLITUDE_SUBIDA_DESCIDA_AVIAO

    grupoRef.current.rotation.y = -angulo + OFFSET_ROTACAO_AVIAO

    const velocidadeVertical = Math.cos(angulo * FREQUENCIA_SUBIDA_DESCIDA_AVIAO)
    grupoRef.current.rotation.x = velocidadeVertical * INCLINACAO_VERTICAL_AVIAO

    grupoRef.current.rotation.z =
      BALANCO_BASE_AVIAO + Math.sin(angulo * FREQUENCIA_BALANCO_AVIAO) * AMPLITUDE_BALANCO_AVIAO

    helicesRef.current.forEach((peca) => {
      peca.rotation[EIXO_ROTACAO_HELICE] += VELOCIDADE_ROTACAO_HELICE * delta
    })

    // hélice "de mentira" enquanto o modelo não tem uma separada
    if (fallbackHeliceRef.current) {
      fallbackHeliceRef.current.rotation[EIXO_ROTACAO_HELICE] += VELOCIDADE_ROTACAO_HELICE * delta
      fallbackHeliceRef.current.children.forEach((malha) => {
        if (malha.material) malha.material.opacity += (t - malha.material.opacity) * 0.08
      })
    }
  })

  return (
    <group ref={grupoRef}>
      <Center>
        <primitive ref={primitiveRef} object={scene} scale={0}>
          {!temHeliceNoModelo && (
            <group ref={fallbackHeliceRef} position={HELICE_FALLBACK_POSICAO}>
              <mesh>
                <boxGeometry args={[0.02, HELICE_FALLBACK_TAMANHO * 2, 0.02]} />
                <meshStandardMaterial color="#222222" transparent opacity={0} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.02, HELICE_FALLBACK_TAMANHO * 2, 0.02]} />
                <meshStandardMaterial color="#222222" transparent opacity={0} />
              </mesh>
            </group>
          )}
        </primitive>
      </Center>
    </group>
  )
}

// segunda lata: some no topo da tela e cai até pousar no lugar em que a
// primeira lata ficava em repouso, no mesmo ritmo em que a primeira cai
// rumo ao quadro-menu (mesmo progressoQueda / energeticosProgressRef)
function Lata2({ energeticosProgressRef, hoverCan2Ref }) {
  const { scene } = useGLTF('/3d/can_2_blue.glb')
  const grupoRef = useRef(null)
  const grupoEscalaRef = useRef(null)
  // grupo próprio só pra rotação do hover, separado da rotação "de repouso"
  // que o grupoRef já carrega — assim uma não briga com a outra
  const grupoGiroHoverRef = useRef(null)
  const hoverAnteriorRef = useRef(false)

  useEffect(() => {
    if (!grupoRef.current) return

    grupoRef.current.position.y = QUEDA_CAN2_Y_INICIAL
    // mesma pose de repouso que a lata 1 tinha antes de cair (já de frente e
    // sem inclinação), mas usando a rotação de frente própria do can_2
    grupoRef.current.rotation.x = 0
    grupoRef.current.rotation.y = ROTACAO_Y_CAN2
    grupoRef.current.rotation.z = 0

    if (grupoEscalaRef.current) {
      grupoEscalaRef.current.scale.setScalar(0)
    }
  }, [])

  useFrame(() => {
    if (!grupoRef.current || !grupoEscalaRef.current) return

    const progressoQueda = energeticosProgressRef?.current ?? 0
    // remapeia: só sai do 0 depois que a lata 1 já passou do limiar, e chega
    // em 1 junto com ela — assim a lata 2 "aguarda" a lata 1 se afastar do
    // centro antes de começar a descer, sem as duas se cruzarem/tocarem
    const progressoCan2 = Math.min(
      1,
      Math.max(0, (progressoQueda - LIMIAR_INICIO_QUEDA_CAN2) / (1 - LIMIAR_INICIO_QUEDA_CAN2))
    )

    // desce do topo da tela até o antigo lugar de repouso da lata 1 (com o
    // pequeno offset pra encaixar no quadrado do meio)
    const alvoY = gsap.utils.interpolate(
      QUEDA_CAN2_Y_INICIAL,
      POSICAO_Y_FINAL + OFFSET_Y_CAN2,
      progressoCan2
    )
    grupoRef.current.position.y +=
      (alvoY - grupoRef.current.position.y) * SUAVIDADE_QUEDA_CAN2_POSICAO

    // "cresce" enquanto cai — esse multiplicador (0 -> 1) fica num grupo por
    // fora do <Center>, que já mede o modelo com a escala final fixa (assim
    // o centro calculado pelo <Center> fica correto e ela some centralizada,
    // em vez de descentralizar conforme ela cresce)
    const fracaoAlvo = progressoCan2 > 0 ? 1 : 0
    const fracaoAtual = grupoEscalaRef.current.scale.x
    const novaFracao = fracaoAtual + (fracaoAlvo - fracaoAtual) * SUAVIDADE_QUEDA_CAN2_ESCALA
    grupoEscalaRef.current.scale.setScalar(novaFracao)

    // hover do quadro-menu: só dispara a animação na transição (borda de
    // subida ou descida), nunca a cada frame — e só existe depois que ela
    // já pousou (energeticos.jsx só liga hoverCan2Ref quando .pousou)
    const hoverAtual = hoverCan2Ref?.current ?? false
    if (hoverAtual !== hoverAnteriorRef.current && grupoGiroHoverRef.current) {
      hoverAnteriorRef.current = hoverAtual
      gsap.killTweensOf(grupoGiroHoverRef.current.rotation)

      if (hoverAtual) {
        // uma volta completa (360°) e termina torta na diagonal
        gsap.to(grupoGiroHoverRef.current.rotation, {
          y: `+=${VOLTA_HOVER_CAN2}`,
          x: INCLINACAO_TORTA_X_CAN2,
          z: INCLINACAO_TORTA_Z_CAN2,
          duration: DURACAO_GIRO_HOVER_CAN2,
          ease: 'power2.inOut',
        })
      } else {
        // mesmo movimento, só que ao contrário: desfaz a volta em y (-360°)
        // junto com a inclinação, na mesma duração da entrada
        gsap.to(grupoGiroHoverRef.current.rotation, {
          y: `-=${VOLTA_HOVER_CAN2}`,
          x: 0,
          z: 0,
          duration: DURACAO_GIRO_HOVER_CAN2,
          ease: 'power2.inOut',
        })
      }
    }
  })

  return (
    <group ref={grupoRef}>
      <group ref={grupoEscalaRef}>
        <group ref={grupoGiroHoverRef}>
          <Center>
            <primitive object={scene} scale={ESCALA_FINAL_CAN2} />
          </Center>
        </group>
      </group>
    </group>
  )
}

// lata que vive dentro de um dos quadrados secundários (esquerda ou direita),
// que só se revelam na fase 2 do scroll da energeticos. Segue a posição do
// próprio quadrado na tela (que já está se movendo via GSAP) projetando o
// centro dele pro mesmo plano 3D em que as outras latas vivem, e cresce a
// partir de 0 junto com o progresso da revelação
function LataLateral({
  caminhoModelo,
  elementoRef,
  elementoCentralRef,
  revelacaoProgressRef,
  escalaFinal,
  rotacaoYFrente,
  offsetY,
  sentidoEntrada,
  hoverRef,
}) {
  const { scene } = useGLTF(caminhoModelo)
  const grupoRef = useRef(null)
  const grupoEscalaRef = useRef(null)
  // grupo próprio só pra rotação do hover, separado da rotação "de repouso"
  // que o grupoRef já carrega — mesma ideia da lata do meio (can_2)
  const grupoGiroHoverRef = useRef(null)
  const hoverAnteriorRef = useRef(false)
  // lembra se, no frame anterior, ela já estava "livre" do quadro central —
  // usado só pra detectar a borda exata em que ela passa a poder aparecer
  const jaLivreRef = useRef(false)
  // guarda o progresso da revelação no frame anterior, só pra saber se o
  // scroll está avançando ou voltando — o "salto" de entrada só pode
  // acontecer indo pra frente; voltando, ela só precisa encolher de volta
  // (senão, qualquer oscilação do scroll perto da borda faz ela "pular" de
  // novo pro ponto de entrada, e não voltar suavemente pro centro)
  const progressoAnteriorRef = useRef(0)

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const planoQueda = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANO_PROFUNDIDADE_QUEDA),
    []
  )
  const alvo = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!grupoRef.current) return
    grupoRef.current.rotation.set(0, rotacaoYFrente, 0)
    if (grupoEscalaRef.current) grupoEscalaRef.current.scale.setScalar(0)
    jaLivreRef.current = false
  }, [rotacaoYFrente])

  useFrame((state) => {
    if (!grupoRef.current || !grupoEscalaRef.current) return

    const progressoRevelacao = revelacaoProgressRef?.current ?? 0
    const tempo = state.clock.getElapsedTime()
    const oscilacaoY = Math.sin(tempo * VELOCIDADE_FLUTUACAO_LATERAL_Y) * AMPLITUDE_FLUTUACAO_LATERAL_Y

    const posicaoMundo = obterPosicaoElementoNoMundo(
      elementoRef,
      state.camera,
      state.size,
      raycaster,
      planoQueda,
      alvo
    )

    // o canvas 3D é uma única camada por cima de TODOS os quadrados (é por
    // isso que a lata do meio "sai" na frente do quadro-menu). Então, mesmo
    // com a lata lateral no lugar certo, se o quadrado dela ainda estiver
    // sobrepondo o quadro do meio (no início da revelação, os 2 nascem
    // exatamente empilhados no mesmo lugar) ela apareceria por cima do
    // quadro central. Por isso ela só fica "livre" quando o próprio
    // retângulo (em tela) já não sobrepõe mais o retângulo do quadro central
    const retLateral = elementoRef?.current?.getBoundingClientRect()
    const retCentral = elementoCentralRef?.current?.getBoundingClientRect()
    const prontoParaComparar =
      !!retLateral &&
      !!retCentral &&
      !(retLateral.width === 0 && retLateral.height === 0) &&
      !(retCentral.width === 0 && retCentral.height === 0)
    const livreDoCentro =
      prontoParaComparar && (retLateral.right <= retCentral.left || retLateral.left >= retCentral.right)

    // só considera "entrando" (avançando) se o progresso realmente cresceu
    // desde o frame anterior — evita disparar a entrada de novo por causa de
    // ruído/scrub quando o scroll está, na real, voltando
    const avancando = progressoRevelacao > progressoAnteriorRef.current

    if (posicaoMundo) {
      const alvoX = posicaoMundo.x
      const alvoY = posicaoMundo.y + offsetY + oscilacaoY

      if (livreDoCentro && !jaLivreRef.current && avancando) {
        // acabou de ficar livre agora: nasce um pouco mais pra fora, no
        // sentido do próprio lado (esquerda entra vindo de mais à esquerda,
        // direita vindo de mais à direita) — mas só uma fração da largura
        // real do próprio quadrado, pra entrada ficar contida perto/dentro
        // dele, não vindo de fora da tela. A partir daqui o lerp abaixo
        // cuida de deslizá-la de fora pra dentro do quadrado
        const larguraCaixaMundo =
          obterLarguraElementoNoMundo(elementoRef, state.camera, state.size, raycaster, planoQueda, alvo) ?? 0
        grupoRef.current.position.x = alvoX + larguraCaixaMundo * FRACAO_ENTRADA_LATERAL * sentidoEntrada
        grupoRef.current.position.y = alvoY
      } else {
        grupoRef.current.position.x += (alvoX - grupoRef.current.position.x) * SUAVIDADE_LATERAL_POSICAO
        grupoRef.current.position.y += (alvoY - grupoRef.current.position.y) * SUAVIDADE_LATERAL_POSICAO
      }
    }

    jaLivreRef.current = livreDoCentro
    progressoAnteriorRef.current = progressoRevelacao

    // hover do próprio quadrado secundário: só dispara a animação na
    // transição (borda de subida ou descida), nunca a cada frame — mesma
    // lógica do hover da lata do meio (can_2)
    const hoverAtual = hoverRef?.current ?? false
    if (hoverAtual !== hoverAnteriorRef.current && grupoGiroHoverRef.current) {
      hoverAnteriorRef.current = hoverAtual
      gsap.killTweensOf(grupoGiroHoverRef.current.rotation)

      if (hoverAtual) {
        gsap.to(grupoGiroHoverRef.current.rotation, {
          y: `+=${VOLTA_HOVER_LATERAL}`,
          x: INCLINACAO_TORTA_X_LATERAL,
          z: INCLINACAO_TORTA_Z_LATERAL,
          duration: DURACAO_GIRO_HOVER_LATERAL,
          ease: 'power2.inOut',
        })
      } else {
        gsap.to(grupoGiroHoverRef.current.rotation, {
          y: `-=${VOLTA_HOVER_LATERAL}`,
          x: 0,
          z: 0,
          duration: DURACAO_GIRO_HOVER_LATERAL,
          ease: 'power2.inOut',
        })
      }
    }

    // até ficar livre do quadro central, fica travada em escala 0 ("escondida
    // atrás" dele); depois disso cresce acompanhando o progresso da revelação
    const fracaoAlvo = livreDoCentro ? progressoRevelacao : 0
    const fracaoAtual = grupoEscalaRef.current.scale.x
    const novaFracao = fracaoAtual + (fracaoAlvo - fracaoAtual) * SUAVIDADE_LATERAL_ESCALA
    grupoEscalaRef.current.scale.setScalar(novaFracao)
  })

  return (
    <group ref={grupoRef}>
      <group ref={grupoEscalaRef}>
        <group ref={grupoGiroHoverRef}>
          <Center>
            <primitive object={scene} scale={escalaFinal} />
          </Center>
        </group>
      </group>
    </group>
  )
}

function Lata3D({
  scrollProgressRef,
  energeticosProgressRef,
  revelacaoProgressRef,
  quadroRef,
  quadroEsquerdaRef,
  quadroDireitaRef,
  hoverCan2Ref,
  hoverCan3Ref,
  hoverCan4Ref,
}) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const progressoPadraoRef = useRef(0)

  useEffect(() => {
    const aoMoverMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    window.addEventListener('mousemove', aoMoverMouse)
    return () => window.removeEventListener('mousemove', aoMoverMouse)
  }, [])

  return (
    <div className="modelo" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0.15, 3.2], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-3, 1, -4]} intensity={0.5} />

        <Suspense fallback={null}>
          <Lata
            mouseRef={mouseRef}
            scrollProgressRef={scrollProgressRef ?? progressoPadraoRef}
            energeticosProgressRef={energeticosProgressRef}
            revelacaoProgressRef={revelacaoProgressRef}
            quadroRef={quadroRef}
          />

          <Aviao
            scrollProgressRef={scrollProgressRef ?? progressoPadraoRef}
            energeticosProgressRef={energeticosProgressRef}
          />

          <Lata2 energeticosProgressRef={energeticosProgressRef} hoverCan2Ref={hoverCan2Ref} />

          <LataLateral
            caminhoModelo="/3d/can_3_green.glb"
            elementoRef={quadroEsquerdaRef}
            elementoCentralRef={quadroRef}
            revelacaoProgressRef={revelacaoProgressRef}
            escalaFinal={ESCALA_FINAL_CAN3}
            rotacaoYFrente={ROTACAO_Y_CAN3}
            offsetY={OFFSET_Y_CAN3}
            sentidoEntrada={-1}
            hoverRef={hoverCan3Ref}
          />

          <LataLateral
            caminhoModelo="/3d/can_4_peach.glb"
            elementoRef={quadroDireitaRef}
            elementoCentralRef={quadroRef}
            revelacaoProgressRef={revelacaoProgressRef}
            escalaFinal={ESCALA_FINAL_CAN4}
            rotacaoYFrente={ROTACAO_Y_CAN4}
            offsetY={OFFSET_Y_CAN4}
            sentidoEntrada={1}
            hoverRef={hoverCan4Ref}
          />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/3d/can_1_original.glb')
useGLTF.preload('/3d/can_2_blue.glb')
useGLTF.preload('/3d/aviao.glb')
useGLTF.preload('/3d/can_3_green.glb')
useGLTF.preload('/3d/can_4_peach.glb')

export default Lata3D