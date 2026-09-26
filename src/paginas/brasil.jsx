import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './brasil.css'
import Adao from './adao.jsx'

const PESSOAS = [
  { foto: '/brasil/pessoas/yndiara-asp.avif', nome: 'Yndiara', sobrenome: 'Asp', esporte: 'Skate' },
  { foto: '/brasil/pessoas/henrique-avancini.avif', nome: 'Henrique', sobrenome: 'Avancini', esporte: 'MTB' },
  { foto: '/brasil/pessoas/lucas-braathen.avif', nome: 'Lucas', sobrenome: 'Braathen', esporte: 'Esqui Alpino' },
  { foto: '/brasil/pessoas/leticia-bufoni.avif', nome: 'Letícia', sobrenome: 'Bufoni', esporte: 'Skate' },
  { foto: '/brasil/pessoas/carlos-burle.avif', nome: 'Carlos', sobrenome: 'Burle', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/pedro-caldas.avif', nome: 'Pedro', sobrenome: 'Caldas', esporte: 'Wakeboard' },
  { foto: '/brasil/pessoas/felipe-camargo.avif', nome: 'Felipe', sobrenome: 'Camargo', esporte: 'Escalada' },
  { foto: '/brasil/pessoas/joao-chinca.avif', nome: 'João', sobrenome: 'Chinca', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/surf-ondas-grandes-lucas-chumbo-mai22.avif', nome: 'Lucas', sobrenome: 'Chumbo', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/sandro-dias-feito-estaiadinha.avif', nome: 'Sandro', sobrenome: 'Dias', esporte: 'Skate' },
  { foto: '/brasil/pessoas/surf-italo-ferreira-retrato.avif', nome: 'Ítalo', sobrenome: 'Ferreira', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/surf-skimboard-lucas-fink.avif', nome: 'Lucas', sobrenome: 'Fink', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/capoeira-arthur-fiu-2018.avif', nome: 'Arthur', sobrenome: 'Fiu', esporte: 'Artes Marciais' },
  { foto: '/brasil/pessoas/rafael-goberna-foto-de-peril-2013.avif', nome: 'Rafael', sobrenome: 'Goberna', esporte: 'Parapente' },
  { foto: '/brasil/pessoas/skate-felipe-gustavo-2023.avif', nome: 'Felipe', sobrenome: 'Gustavo', esporte: 'Skate' },
  { foto: '/brasil/pessoas/futebol-neymar-jrs-five-final-mundial-2022.avif', nome: 'Neymar', sobrenome: 'Jr.', esporte: 'Futebol' },
  { foto: '/brasil/pessoas/jucelino-junior-red-bull-cliff-diving-mostar-2026.avif', nome: 'Jucelino', sobrenome: 'Junior', esporte: 'Cliff Diving' },
  { foto: '/brasil/pessoas/kitesurfe-bruna-kajiya-2020.avif', nome: 'Bruna', sobrenome: 'Kajiya', esporte: 'Kitesurfe' },
  { foto: '/brasil/pessoas/volei-de-praia-duda-lisboa-circuito-mundial-letonia-2022.avif', nome: 'Duda', sobrenome: 'Lisboa', esporte: 'Vôlei de Praia' },
  { foto: '/brasil/pessoas/fernanda-maciel.avif', nome: 'Fernanda', sobrenome: 'Maciel', esporte: 'Corrida' },
  { foto: '/brasil/pessoas/motor-rali-retrato-lucas-moraes.avif', nome: 'Lucas', sobrenome: 'Moraes', esporte: 'Rali' },
  { foto: '/brasil/pessoas/diogo-moreira-motogp.avif', nome: 'Diogo', sobrenome: 'Moreira', esporte: 'MotoGP' },
  { foto: '/brasil/pessoas/ana-patricia.avif', nome: 'Ana', sobrenome: 'Patrícia', esporte: 'Vôlei de Praia' },
  { foto: '/brasil/pessoas/skate-lucas-rabelo-2-2024.avif', nome: 'Lucas', sobrenome: 'Rabelo', esporte: 'Skate' },
  { foto: '/brasil/pessoas/surf-pedro-scooby-vianna-2019.avif', nome: 'Pedro', sobrenome: 'Scooby', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/paty-valente-2024.avif', nome: 'Paty', sobrenome: 'Valente', esporte: 'Cliff Diving' },
  { foto: '/brasil/pessoas/alexandre-gaules-borba-chiqueta-brasil.avif', nome: 'Gaules', sobrenome: '', esporte: 'Esports' },
  { foto: '/brasil/pessoas/gabriela-gabs-freindrofer.avif', nome: 'Gabs', sobrenome: '', esporte: 'Esports' },
  { foto: '/brasil/pessoas/lennon-dos-santos-portrait.avif', nome: 'L7nnon', sobrenome: '', esporte: 'Skate' },
  { foto: '/brasil/pessoas/futebol-endrick-bola-1.avif', nome: 'Endrick', sobrenome: '', esporte: 'Futebol' },
]

const PESSOAS_POR_PAGINA = 15

function Brasil({ brasilRef, galeriaListaRef }) {
  const videoRef = useRef(null)
  const barraRef = useRef(null)

  const bandeiraContainerRef = useRef(null)
  const reveladaRef = useRef(null)


  const parallaxTextoRef = useRef(null)
  const parallaxBandeiraRef = useRef(null)
  const parallaxVideoRef = useRef(null)

  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [tempoAtual, setTempoAtual] = useState(0)
  const [mudo, setMudo] = useState(true)
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(PESSOAS_POR_PAGINA)

  const pessoasVisiveis = PESSOAS.slice(0, quantidadeVisivel)
  const temMaisPessoas = quantidadeVisivel < PESSOAS.length
  const podeMostrarMenos = quantidadeVisivel > PESSOAS_POR_PAGINA

  const aoCarregarMais = () => {
    setQuantidadeVisivel((atual) => Math.min(PESSOAS.length, atual + PESSOAS_POR_PAGINA))
  }

  const aoMostrarMenos = () => {
    setQuantidadeVisivel(PESSOAS_POR_PAGINA)
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
    return () => cancelAnimationFrame(id)
  }, [quantidadeVisivel])

  // efeito parallax
  useEffect(() => {
    const alvoTexto = parallaxTextoRef.current
    const alvoBandeira = parallaxBandeiraRef.current
    const alvoVideo = parallaxVideoRef.current
    if (!alvoTexto || !alvoBandeira || !alvoVideo) return

    const config = {
      texto: { x: 14, y: 8 },
      bandeira: { x: -26, y: 16 },
      video: { x: 22, y: -12 },
    }

    const opcoesQuickTo = { duration: 0.7, ease: 'power3.out' }

    const setTextoX = gsap.quickTo(alvoTexto, 'x', opcoesQuickTo)
    const setTextoY = gsap.quickTo(alvoTexto, 'y', opcoesQuickTo)
    const setBandeiraX = gsap.quickTo(alvoBandeira, 'x', opcoesQuickTo)
    const setBandeiraY = gsap.quickTo(alvoBandeira, 'y', opcoesQuickTo)
    const setVideoX = gsap.quickTo(alvoVideo, 'x', opcoesQuickTo)
    const setVideoY = gsap.quickTo(alvoVideo, 'y', opcoesQuickTo)

    const aoMoverMouse = (evento) => {

      const px = evento.clientX / window.innerWidth - 0.5
      const py = evento.clientY / window.innerHeight - 0.5

      setTextoX(px * config.texto.x)
      setTextoY(py * config.texto.y)
      setBandeiraX(px * config.bandeira.x)
      setBandeiraY(py * config.bandeira.y)
      setVideoX(px * config.video.x)
      setVideoY(py * config.video.y)
    }

    window.addEventListener('mousemove', aoMoverMouse)
    return () => window.removeEventListener('mousemove', aoMoverMouse)
  }, [])


  useEffect(() => {
    const container = bandeiraContainerRef.current
    const revelada = reveladaRef.current
    if (!container || !revelada) return

    const pos = { x: 0, y: 0, size: 0 }

    const setX = gsap.quickTo(pos, 'x', {
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: atualizarMascara,
    })

    const setY = gsap.quickTo(pos, 'y', {
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: atualizarMascara,
    })

    function atualizarMascara() {
        const mask = `radial-gradient(circle ${pos.size}px at ${pos.x}px ${pos.y}px, black 75%, transparent 100%)`
  revelada.style.webkitMaskImage = mask
  revelada.style.maskImage = mask
}


    const aoEntrar = (e) => {
  const rect = container.getBoundingClientRect()
  pos.x = e.clientX - rect.left
  pos.y = e.clientY - rect.top

      gsap.to(pos, {
        size: 180, 
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: atualizarMascara,
      })
    }

    const aoMover = (e) => {
      const rect = container.getBoundingClientRect()
      setX(e.clientX - rect.left)
      setY(e.clientY - rect.top)
    }

    const aoSair = () => {

      gsap.to(pos, {
        size: 0,
        duration: 0.4,
        ease: 'power2.in',
        onUpdate: atualizarMascara,
      })
    }

    container.addEventListener('mouseenter', aoEntrar)
    container.addEventListener('mousemove', aoMover)
    container.addEventListener('mouseleave', aoSair)

    return () => {
      container.removeEventListener('mouseenter', aoEntrar)
      container.removeEventListener('mousemove', aoMover)
      container.removeEventListener('mouseleave', aoSair)
    }
  }, [])

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
    const seg = Math.floor(segundos % 60).toString().padStart(2, '0')
    return `${min}:${seg}`
  }

  const aoMoverNaFoto = (evento) => {
    const rect = evento.currentTarget.getBoundingClientRect()
    const x = evento.clientX - rect.left
    const y = evento.clientY - rect.top
    evento.currentTarget.style.setProperty('--mx', `${x}px`)
    evento.currentTarget.style.setProperty('--my', `${y}px`)
  }

  return (
    <div ref={brasilRef} className="brasil-cena">
      <div className="brasil-fundo" />
      <div className="brasil-scroll-viewport">
        <div ref={galeriaListaRef} className="brasil-scroll-content">
          <div className="brasil-tela-inicial">
            <div ref={parallaxTextoRef} className="brasil-parallax">
              <div className="brasil-conteudo">
                <h2 className="brasil-titulo">
                  <span className="brasil-linha brasil-linha-escura">O Brasil</span>
                  <span className="brasil-linha brasil-linha-escura">em todos os</span>
                  <span className="brasil-linha brasil-linha-escura">esportes radicais</span>
                  <span className="brasil-linha brasil-linha-clara">nossa cultura</span>
                  <span className="brasil-linha brasil-linha-clara">também dá aaasas</span>
                </h2>
              </div>
            </div>

            {/* Container com as duas bandeiras sobrepostas */}
            <div ref={parallaxBandeiraRef} className="brasil-parallax">
              <div ref={bandeiraContainerRef} className="brasil-bandeira-wrap">
                {/* Camada 1: Bandeira base do Brasil */}
                <img
                  src="/brasil/bandeirabrasil.webp"
                  alt="Bandeira do Brasil"
                  className="brasil-bandeira"
                  draggable={false}
                />

                {/* Camada 2: Bandeira Red Bull revelada pela máscara */}
                <div ref={reveladaRef} className="brasil-bandeira-reveal">
                  <img
                    src="/brasil/bandeirared.webp"
                    alt="Bandeira Red Bull"
                    className="brasil-bandeira"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            <div ref={parallaxVideoRef} className="brasil-parallax">
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
          </div>

          <div className="brasil-galeria-cabecalho">
            <h3 className="brasil-galeria-titulo">Atletas</h3>
            <p className="brasil-galeria-subtitulo">
              Conheça os atletas do mundo Red Bull, suas trajetórias, suas conquistas e muito mais!
            </p>
          </div>

          <div className="brasil-galeria-lista">
            {pessoasVisiveis.map((pessoa, i) => (
              <div className="brasil-pessoa" key={i}>
                <div
                  className="brasil-pessoa-foto-wrap"
                  onMouseEnter={aoMoverNaFoto}
                  onMouseMove={aoMoverNaFoto}
                >
                  <img
                    src={pessoa.foto}
                    alt={`${pessoa.nome}${pessoa.sobrenome ? ` ${pessoa.sobrenome}` : ''}`}
                    className="brasil-pessoa-foto"
                    draggable={false}
                  />

                  <div className="brasil-pessoa-hover" aria-hidden="true">
                    <span className="brasil-pessoa-hover-texto">
                      {'Saiba mais'.split('').map((letra, li) => (
                        <span
                          key={li}
                          className="brasil-pessoa-hover-letra"
                          style={{ transitionDelay: `${0.16 + li * 0.028}s` }}
                        >
                          {letra === ' ' ? '\u00A0' : letra}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                <span className="brasil-pessoa-nome">
                  {pessoa.nome}
                  {pessoa.sobrenome && (
                    <>
                      <br />
                      <span className="brasil-pessoa-sobrenome">{pessoa.sobrenome}</span>
                    </>
                  )}
                </span>
                <span className="brasil-pessoa-esporte">{pessoa.esporte}</span>
              </div>
            ))}
          </div>

          {(temMaisPessoas || podeMostrarMenos) && (
            <div className="brasil-carregar-mais-wrap">
              {temMaisPessoas && (
                <button
                  type="button"
                  className="brasil-carregar-mais"
                  onClick={aoCarregarMais}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                  Carregar mais
                </button>
              )}

              {!temMaisPessoas && podeMostrarMenos && (
                <button
                  type="button"
                  className="brasil-carregar-mais"
                  onClick={aoMostrarMenos}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                  Mostrar menos
                </button>
              )}
            </div>
          )}

          <Adao />
        </div>
      </div>
    </div>
  )
}

export default Brasil