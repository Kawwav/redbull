import { useRef, useState } from 'react'
import './brasil.css'

function Brasil({ brasilRef }) {
  const videoRef = useRef(null)
  const barraRef = useRef(null)

  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [tempoAtual, setTempoAtual] = useState(0)
  const [mudo, setMudo] = useState(true)

  const alternarPlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setTocando(true)
    } else {
      video.pause()
      setTocando(false)
    }
  }

  const alternarMudo = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMudo(video.muted)
  }

  const aoCarregarMetadados = () => {
    setDuracao(videoRef.current?.duration || 0)
  }

  const aoAtualizarTempo = () => {
    const video = videoRef.current
    if (!video) return
    setTempoAtual(video.currentTime)
    setProgresso(video.duration ? (video.currentTime / video.duration) * 100 : 0)
  }

  const clicarNaBarra = (evento) => {
    const video = videoRef.current
    const barra = barraRef.current
    if (!video || !barra || !video.duration) return
    const retangulo = barra.getBoundingClientRect()
    const proporcao = Math.min(1, Math.max(0, (evento.clientX - retangulo.left) / retangulo.width))
    video.currentTime = proporcao * video.duration
  }

  const formatarTempo = (segundos) => {
    if (!Number.isFinite(segundos)) return '0:00'
    const min = Math.floor(segundos / 60)
    const seg = Math.floor(segundos % 60)
      .toString()
      .padStart(2, '0')
    return `${min}:${seg}`
  }

  return (
    <div ref={brasilRef} className="brasil-cena">
      <div className="brasil-fundo" />

      <div className="brasil-conteudo">
        <h2 className="brasil-titulo">
          <span className="brasil-linha brasil-linha-escura">O Brasil</span>
          <span className="brasil-linha brasil-linha-escura">em todos os</span>
          <span className="brasil-linha brasil-linha-escura">esportes radicais</span>
          <span className="brasil-linha brasil-linha-clara">nossa cultura</span>
          <span className="brasil-linha brasil-linha-clara">também dá aaasas</span>
        </h2>
      </div>

      <div className="brasil-bandeira-wrap">
        <img src="/brasil/bandeirabrasil.webp" alt="Bandeira do Brasil" className="brasil-bandeira" />
      </div>

      <div className="brasil-video-wrap">
        <div className="brasil-video-moldura" onClick={alternarPlay}>
          <video
            ref={videoRef}
            className="brasil-video"
            src="/brasil/video.mp4"
            playsInline
            muted={mudo}
            loop
            onLoadedMetadata={aoCarregarMetadados}
            onTimeUpdate={aoAtualizarTempo}
          />

          {!tocando && (
            <button
              className="brasil-video-play"
              onClick={(evento) => {
                evento.stopPropagation()
                alternarPlay()
              }}
              aria-label="Reproduzir vídeo"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#0b0b0b">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>

        <div className="brasil-video-controles" onClick={(evento) => evento.stopPropagation()}>
          <button
            className="brasil-video-botao"
            onClick={alternarPlay}
            aria-label={tocando ? 'Pausar' : 'Reproduzir'}
          >
            {tocando ? (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <span className="brasil-video-tempo">{formatarTempo(tempoAtual)}</span>

          <div className="brasil-video-barra" ref={barraRef} onClick={clicarNaBarra}>
            <div className="brasil-video-barra-preenchida" style={{ width: `${progresso}%` }} />
          </div>

          <span className="brasil-video-tempo">{formatarTempo(duracao)}</span>

          <button
            className="brasil-video-botao"
            onClick={alternarMudo}
            aria-label={mudo ? 'Ativar som' : 'Silenciar'}
          >
            {mudo ? (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M16.5 12A4.5 4.5 0 0014 7.97v8.06A4.5 4.5 0 0016.5 12zM4.34 2.93L2.93 4.34 7.29 8.7H3v6.6h4l5 5v-6.99l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06a9.16 9.16 0 003.61-1.71l1.33 1.33 1.41-1.41L4.34 2.93zM12 4L9.83 6.17 12 8.34V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.06A4.5 4.5 0 0016.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Brasil