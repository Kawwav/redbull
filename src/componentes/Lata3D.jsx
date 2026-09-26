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
const LIMIAR_INICIO_MORTAL_COMECO = 0.92 
const PESO_MORTAL_COMECO = 0.25 
const LIMIAR_FIM_MORTAL_ENERGETICOS = 0.4 
const VOLTAS_MORTAL = 1 
const SENTIDO_MORTAL = 1 
const SUAVIDADE_MORTAL = 0.028 
const SUAVIDADE_QUEDA_POSICAO = 0.045
const SUAVIDADE_QUEDA_ESCALA = 0.06
const SUAVIDADE_POUSO_SUMIR = 0.025 
const ESCALA_POUSO_NO_QUADRO = 6.2 
const OFFSET_Y_POUSO = -0.19 
const LIMIAR_TRAVAR_POUSO = 0.97 
const LIMIAR_ESCALA_ESCONDER_CAN1 = 0.03 
const INCLINACAO_POUSO_X = 0.16 
const INCLINACAO_POUSO_Z = -0.4 
const AFUNDAMENTO_SUMIR = 2.8 
const PLANO_PROFUNDIDADE_QUEDA = 0

const INICIO_FADE_AVIAO = 0.05 
const FIM_FADE_AVIAO = 0.2 

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


const EIXO_ROTACAO_HELICE = 'x'
const VELOCIDADE_ROTACAO_HELICE = 18 // rad/s

const HELICE_FALLBACK_POSICAO = [-0.82, 0, 0]
const HELICE_FALLBACK_TAMANHO = 0.22

const QUEDA_CAN2_Y_INICIAL = POSICAO_Y_FINAL + 4.5
const OFFSET_Y_CAN2 = 0.02
const ROTACAO_Y_CAN2 = 0 
const LIMIAR_INICIO_QUEDA_CAN2 = 0.5 
const SUAVIDADE_QUEDA_CAN2_POSICAO = 0.05
const SUAVIDADE_QUEDA_CAN2_ESCALA = 0.06

const FATOR_ESCALA_CAN2 = 0.6
const ESCALA_FINAL_CAN2 = ESCALA_FINAL * FATOR_ESCALA_CAN2

const VOLTA_HOVER_CAN2 = Math.PI * 2 
const INCLINACAO_TORTA_X_CAN2 = 0.32
const INCLINACAO_TORTA_Z_CAN2 = -0.4
const DURACAO_GIRO_HOVER_CAN2 = 0.9

const ESCALA_LATERAL_BASE = 4.2
const FATOR_ESCALA_CAN3 = 1 
const FATOR_ESCALA_CAN4 = 1 
const ESCALA_FINAL_CAN3 = ESCALA_LATERAL_BASE * FATOR_ESCALA_CAN3
const ESCALA_FINAL_CAN4 = ESCALA_LATERAL_BASE * FATOR_ESCALA_CAN4

const ROTACAO_Y_CAN3 = 0 
const ROTACAO_Y_CAN4 = 0 

const OFFSET_Y_CAN3 = 0 // ajuste fino de altura dentro do quadrado esquerdo
const OFFSET_Y_CAN4 = 0 // ajuste fino de altura dentro do quadrado direito


const SUAVIDADE_LATERAL_POSICAO = 0.08
const SUAVIDADE_LATERAL_ESCALA = 0.07

const VOLTA_HOVER_LATERAL = Math.PI * 2 // 360°
const INCLINACAO_TORTA_X_LATERAL = 0.32
const INCLINACAO_TORTA_Z_LATERAL = -0.4
const DURACAO_GIRO_HOVER_LATERAL = 0.9

const FRACAO_ENTRADA_LATERAL = 0.45

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

  const [visivel, setVisivel] = useState(true)
  const escondidoRef = useRef(false)

  // raycaster + plano reaproveitados a cada frame pra não recriar objetos no loop
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const planoQueda = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANO_PROFUNDIDADE_QUEDA),
    []
  )
  const alvoQueda = useMemo(() => new THREE.Vector3(), [])

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


    gsap.fromTo(
      grupoRef.current.position,
      { y: -2.4 },
      { y: POSICAO_Y_FINAL, duration: 1.4, ease: 'power3.out' }
    )
  }, [])

  useFrame((state) => {
    if (!grupoRef.current) return

    const progresso = scrollProgressRef?.current ?? 0

    const progressoQueda = energeticosProgressRef?.current ?? 0

    const progressoSumir = revelacaoProgressRef?.current ?? 0
    const { x, y } = mouseRef.current
    const faseComeco = Math.min(
      1,
      Math.max(0, (progresso - LIMIAR_INICIO_MORTAL_COMECO) / (1 - LIMIAR_INICIO_MORTAL_COMECO))
    )
    const faseEnergeticos = Math.min(1, Math.max(0, progressoQueda / LIMIAR_FIM_MORTAL_ENERGETICOS))
    const progressoMortal =
      faseComeco * PESO_MORTAL_COMECO + faseEnergeticos * (1 - PESO_MORTAL_COMECO)

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

    if (mortalRef.current) {
      const rotacaoAlvoMortal = progressoMortal * Math.PI * 2 * VOLTAS_MORTAL * SENTIDO_MORTAL
      mortalRef.current.rotation.x +=
        (rotacaoAlvoMortal - mortalRef.current.rotation.x) * SUAVIDADE_MORTAL
    }
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

      grupoRef.current.position.x += (0 - grupoRef.current.position.x) * SUAVIDADE_QUEDA_POSICAO
      grupoRef.current.position.y +=
        (POSICAO_Y_FINAL - grupoRef.current.position.y) * SUAVIDADE_QUEDA_POSICAO
    }

    if (primitiveRef.current) {
      const escalaComeco = gsap.utils.interpolate(ESCALA_INICIAL, ESCALA_FINAL, progresso)
      const escalaAlvoPouso = gsap.utils.interpolate(escalaComeco, ESCALA_POUSO_NO_QUADRO, progressoQueda)
      // na 2ª fase, além de descer, ela encolhe até sumir de vez
      const escalaAlvo = gsap.utils.interpolate(escalaAlvoPouso, 0, progressoSumir)

      let novaEscala
      if (progressoQueda >= LIMIAR_TRAVAR_POUSO) {
        const escalaAtual = primitiveRef.current.scale.x
        novaEscala = escalaAtual + (escalaAlvo - escalaAtual) * SUAVIDADE_POUSO_SUMIR
        primitiveRef.current.scale.setScalar(novaEscala)
      } else {
        const escalaAtual = primitiveRef.current.scale.x
        novaEscala =
          escalaAtual +
          (escalaAlvo - escalaAtual) *
            (progressoQueda > 0 ? SUAVIDADE_QUEDA_ESCALA : 0.08)
        primitiveRef.current.scale.setScalar(novaEscala)
      }

      const deveEsconder = progressoSumir > 0 && novaEscala < LIMIAR_ESCALA_ESCONDER_CAN1
      if (deveEsconder !== escondidoRef.current) {
        escondidoRef.current = deveEsconder
        setVisivel(!deveEsconder)
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
      <group ref={balancoRef} visible={visivel}>
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

function Lata2({ energeticosProgressRef, hoverCan2Ref, quadroRef }) {
  const { scene } = useGLTF('/3d/can_2_blue.glb')
  const grupoRef = useRef(null)
  const grupoEscalaRef = useRef(null)

  const grupoGiroHoverRef = useRef(null)
  const hoverAnteriorRef = useRef(false)

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const planoQueda = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANO_PROFUNDIDADE_QUEDA),
    []
  )
  const alvoMundo = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (!grupoRef.current) return

    grupoRef.current.position.y = QUEDA_CAN2_Y_INICIAL

    grupoRef.current.rotation.x = 0
    grupoRef.current.rotation.y = ROTACAO_Y_CAN2
    grupoRef.current.rotation.z = 0

    if (grupoEscalaRef.current) {
      grupoEscalaRef.current.scale.setScalar(0)
    }
  }, [])

  useFrame((state) => {
    if (!grupoRef.current || !grupoEscalaRef.current) return

    const progressoQueda = energeticosProgressRef?.current ?? 0

    const progressoCan2 = Math.min(
      1,
      Math.max(0, (progressoQueda - LIMIAR_INICIO_QUEDA_CAN2) / (1 - LIMIAR_INICIO_QUEDA_CAN2))
    )

    const posicaoQuadro = obterPosicaoElementoNoMundo(
      quadroRef,
      state.camera,
      state.size,
      raycaster,
      planoQueda,
      alvoMundo
    )

    const alvoYPousado = posicaoQuadro ? posicaoQuadro.y + OFFSET_Y_CAN2 : POSICAO_Y_FINAL + OFFSET_Y_CAN2
    const alvoXPousado = posicaoQuadro ? posicaoQuadro.x : 0

    const alvoY = gsap.utils.interpolate(QUEDA_CAN2_Y_INICIAL, alvoYPousado, progressoCan2)
    const alvoX = gsap.utils.interpolate(0, alvoXPousado, progressoCan2)

    grupoRef.current.position.x +=
      (alvoX - grupoRef.current.position.x) * SUAVIDADE_QUEDA_CAN2_POSICAO
    grupoRef.current.position.y +=
      (alvoY - grupoRef.current.position.y) * SUAVIDADE_QUEDA_CAN2_POSICAO


    const fracaoAlvo = progressoCan2 > 0 ? 1 : 0
    const fracaoAtual = grupoEscalaRef.current.scale.x
    const novaFracao = fracaoAtual + (fracaoAlvo - fracaoAtual) * SUAVIDADE_QUEDA_CAN2_ESCALA
    grupoEscalaRef.current.scale.setScalar(novaFracao)
    const hoverAtual = hoverCan2Ref?.current ?? false
    if (hoverAtual !== hoverAnteriorRef.current && grupoGiroHoverRef.current) {
      hoverAnteriorRef.current = hoverAtual
      gsap.killTweensOf(grupoGiroHoverRef.current.rotation)

      if (hoverAtual) {
        gsap.to(grupoGiroHoverRef.current.rotation, {
          y: `+=${VOLTA_HOVER_CAN2}`,
          x: INCLINACAO_TORTA_X_CAN2,
          z: INCLINACAO_TORTA_Z_CAN2,
          duration: DURACAO_GIRO_HOVER_CAN2,
          ease: 'power2.inOut',
        })
      } else {
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
  const grupoGiroHoverRef = useRef(null)
  const hoverAnteriorRef = useRef(false)
  const jaLivreRef = useRef(false)
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

    const posicaoMundo = obterPosicaoElementoNoMundo(
      elementoRef,
      state.camera,
      state.size,
      raycaster,
      planoQueda,
      alvo
    )

    const retLateral = elementoRef?.current?.getBoundingClientRect()
    const retCentral = elementoCentralRef?.current?.getBoundingClientRect()
    const prontoParaComparar =
      !!retLateral &&
      !!retCentral &&
      !(retLateral.width === 0 && retLateral.height === 0) &&
      !(retCentral.width === 0 && retCentral.height === 0)
    const livreDoCentro =
      prontoParaComparar && (retLateral.right <= retCentral.left || retLateral.left >= retCentral.right)

    const avancando = progressoRevelacao > progressoAnteriorRef.current

    if (posicaoMundo) {
      const alvoX = posicaoMundo.x
      const alvoY = posicaoMundo.y + offsetY

      if (livreDoCentro && !jaLivreRef.current && avancando) {
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

          <Lata2
            energeticosProgressRef={energeticosProgressRef}
            hoverCan2Ref={hoverCan2Ref}
            quadroRef={quadroRef}
          />

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