import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Header from '../componentes/header.jsx'
import './comeco.css'

gsap.registerPlugin(ScrollTrigger)

const LIMIAR_MOSTRAR_HEADER = 0.85
const LIMIAR_SOMEM_IMAGENS = 0.3
const LIMIAR_MOSTRAR_TEXTO = 0.5

// quantos segundos antes do fim real do vídeo a troca pras imagens (touros/redbull)
// já acontece — como as imagens são o mesmo quadro final do vídeo, trocar um
// pouco antes (~3 frames a 24fps) evita o corte seco/travada perceptível
const TEMPO_ANTECIPACAO_TROCA = 0.125
function dividirEmLetras(texto) {
  const partes = []
  const palavras = texto.split(' ')

  palavras.forEach((palavra, indicePalavra) => {
    partes.push(
      <span className="palavra" key={`palavra-${indicePalavra}`}>
        {palavra.split('').map((letra, indiceLetra) => (
          <span className="mascara" key={indiceLetra}>
            <span className="conteudo">{letra}</span>
          </span>
        ))}
      </span>
    )

    if (indicePalavra < palavras.length - 1) {
      partes.push(' ')
    }
  })

  return partes
}

function Comeco({ mostrarLata, aoMostrarLata, scrollProgressRef, redbullRef }) {
  const videoRef = useRef(null)
  const [mostrarHeader, setMostrarHeader] = useState(false)
  const [mostrarTexto, setMostrarTexto] = useState(false)

  const scrollWrapperRef = useRef(null)
  const comecoRef = useRef(null)
  const tourosRef = useRef(null)
  const textoRef = useRef(null)
  const textoLateralRef = useRef(null)
  const videoCantoRef = useRef(null)

  useEffect(() => {
    const valor = mostrarLata ? '' : 'hidden'
    document.documentElement.style.overflow = valor
    document.body.style.overflow = valor
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [mostrarLata])

  useEffect(() => {
    const touros = new Image()
    touros.src = '/imagens/touros.png'

    const redbull = new Image()
    redbull.src = '/imagens/redbull.png'

    const videoCanto = document.createElement('video')
    videoCanto.src = '/videos/download.mp4'
    videoCanto.preload = 'auto'
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const congelarUltimoFrame = () => {
      video.pause()
      aoMostrarLata()
    }

    const TEMPO_MAXIMO_ESPERA_MS = 8000
    const tempoSeguranca = setTimeout(congelarUltimoFrame, TEMPO_MAXIMO_ESPERA_MS)

    let jaTrocou = false
    const trocar = () => {
      if (jaTrocou) return
      jaTrocou = true
      clearTimeout(tempoSeguranca)
      congelarUltimoFrame()
    }

    const aoAtualizarTempo = () => {
      if (!video.duration) return
      if (video.currentTime >= video.duration - TEMPO_ANTECIPACAO_TROCA) {
        trocar()
      }
    }

    video.addEventListener('timeupdate', aoAtualizarTempo)
    video.addEventListener('ended', trocar)
    video.addEventListener('error', trocar)
    video.addEventListener('stalled', trocar)

    return () => {
      clearTimeout(tempoSeguranca)
      video.removeEventListener('timeupdate', aoAtualizarTempo)
      video.removeEventListener('ended', trocar)
      video.removeEventListener('error', trocar)
      video.removeEventListener('stalled', trocar)
    }
  }, [aoMostrarLata])

  useLayoutEffect(() => {
    if (!mostrarLata) return

    const letras = [
      ...(textoRef.current?.querySelectorAll('.conteudo') ?? []),
      ...(textoLateralRef.current?.querySelectorAll('.conteudo') ?? []),
    ]
    if (letras.length > 0) {
      gsap.set(letras, { yPercent: 100, opacity: 0 })
    }

    if (videoCantoRef.current) {
      gsap.set(videoCantoRef.current, { xPercent: 150 })
    }
  }, [mostrarLata])

  useEffect(() => {
    if (!mostrarLata || !videoCantoRef.current) return

    gsap.to(videoCantoRef.current, {
      xPercent: mostrarTexto ? 150 : 0,
      duration: mostrarTexto ? 0.5 : 0.7,
      ease: mostrarTexto ? 'power2.in' : 'power3.out',
      overwrite: true,
    })
  }, [mostrarTexto, mostrarLata])

  useEffect(() => {

    if (!mostrarLata) return

    const letrasTitulo = textoRef.current?.querySelectorAll('.conteudo') ?? []
    const letrasLateral = textoLateralRef.current?.querySelectorAll('.conteudo') ?? []

    if (letrasTitulo.length === 0 && letrasLateral.length === 0) return

    const animar = (letras) => {
      if (letras.length === 0) return
      gsap.to(letras, {
        yPercent: mostrarTexto ? 0 : 100,
        opacity: mostrarTexto ? 1 : 0,
        duration: mostrarTexto ? 0.65 : 0.35,
        ease: mostrarTexto ? 'back.out(1.6)' : 'power2.in',
        stagger: {
          amount: mostrarTexto ? 0.4 : 0.2, 
          from: 'start',
        },
        overwrite: true,
      })
    }

    animar(letrasTitulo)
    animar(letrasLateral)
  }, [mostrarTexto, mostrarLata])

  useGSAP(
    () => {
      if (!mostrarLata) return
      if (!scrollWrapperRef.current || !comecoRef.current) return

      const config = {
        trigger: scrollWrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      }

      ScrollTrigger.create({
        ...config,
        pin: comecoRef.current,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress

          const progressoImagens = Math.min(1, self.progress / LIMIAR_SOMEM_IMAGENS)
          gsap.set(tourosRef.current, {
            yPercent: progressoImagens * -120,
            opacity: 1 - progressoImagens,
          })
          gsap.set(redbullRef.current, {
            yPercent: progressoImagens * 120,
            opacity: 1 - progressoImagens,
          })

          setMostrarTexto(self.progress >= LIMIAR_MOSTRAR_TEXTO)
          setMostrarHeader(self.progress >= LIMIAR_MOSTRAR_HEADER)
        },
      })

      ScrollTrigger.refresh()
    },
    { scope: scrollWrapperRef, dependencies: [mostrarLata, scrollProgressRef, redbullRef] }
  )

  return (
    <>
      <Header visivel={mostrarHeader} />

      <div
        ref={scrollWrapperRef}
        className="rolagem"
        style={{ height: mostrarLata ? undefined : '100svh' }}
      >
        <div ref={comecoRef} className="comeco">
          {!mostrarLata && (
            <video
              ref={videoRef}
              className="video"
              src="/videos/fundo.mp4"
              preload="auto"
              autoPlay
              muted
              playsInline
            />
          )}

          {mostrarLata && (
            <>
              <div ref={tourosRef} className="touros">
                <img
                  src="/imagens/touros.png"
                  alt="Touros Red Bull"
                  className="imagem"
                />
              </div>

              <div ref={textoRef} className="fundo">
                <h2>
                  {dividirEmLetras('RED BULL TE DA')}
                  <span className="linha2">
                    {dividirEmLetras('AAASAS!')}
                  </span>
                </h2>
              </div>

              <div ref={textoLateralRef} className="lateral">
                <p>
                  {dividirEmLetras(
                    'Red Bull Energy Drink é apreciado no mundo todo por atletas de elite, profissionais dinâmicos, estudantes ativos e motoristas em viagens longas.'
                  )}
                </p>
              </div>

              <video
                ref={videoCantoRef}
                className="videoCanto"
                src="/videos/download.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Comeco