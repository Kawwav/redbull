import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Header from '../componentes/header.jsx'
import './comeco.css'

gsap.registerPlugin(ScrollTrigger)

const LIMIAR_MOSTRAR_HEADER = 0.85
const LIMIAR_SOMEM_IMAGENS = 0.3
const LIMIAR_MOSTRAR_TEXTO = 0.5
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
    const video = videoRef.current
    if (!video) return

    const acelerar = () => {
      video.playbackRate = 1.6
    }

    const congelarUltimoFrame = () => {
      video.pause()
      aoMostrarLata()
    }

    // trava de segurança: se o navegador bloquear o autoplay, o arquivo
    // falhar ao carregar, ou o evento "ended" simplesmente não disparar,
    // o scroll não pode ficar travado pra sempre esperando o vídeo acabar
    const TEMPO_MAXIMO_ESPERA_MS = 8000
    const tempoSeguranca = setTimeout(congelarUltimoFrame, TEMPO_MAXIMO_ESPERA_MS)

    const aoTerminar = () => {
      clearTimeout(tempoSeguranca)
      congelarUltimoFrame()
    }

    const aoDarErro = () => {
      clearTimeout(tempoSeguranca)
      congelarUltimoFrame()
    }

    video.addEventListener('loadedmetadata', acelerar)
    video.addEventListener('ended', aoTerminar)
    video.addEventListener('error', aoDarErro)
    video.addEventListener('stalled', aoDarErro)

    return () => {
      clearTimeout(tempoSeguranca)
      video.removeEventListener('loadedmetadata', acelerar)
      video.removeEventListener('ended', aoTerminar)
      video.removeEventListener('error', aoDarErro)
      video.removeEventListener('stalled', aoDarErro)
    }
  }, [aoMostrarLata])

  useEffect(() => {
    if (!mostrarLata) return

    const letras = [
      ...(textoRef.current?.querySelectorAll('.conteudo') ?? []),
      ...(textoLateralRef.current?.querySelectorAll('.conteudo') ?? []),
    ]
    if (letras.length === 0) return

    gsap.set(letras, { yPercent: 100, opacity: 0 })

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
    // sobe as letras uma a uma quando o scroll passa do limiar
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
          amount: mostrarTexto ? 0.4 : 0.2, // tempo total da cascata, igual pros dois textos
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

      // garante que o pin/scroll seja recalculado assim que o vídeo some
      // e as novas seções (com imagens, textos e o vídeo de canto) entram no DOM
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