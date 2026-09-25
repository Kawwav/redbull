import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import './brasil.css'

const PESSOAS = [
  { foto: '/brasil/pessoas/yndiara-asp.webp', nome: 'Yndiara', sobrenome: 'Asp', esporte: 'Skate' },
  { foto: '/brasil/pessoas/henrique-avancini.webp', nome: 'Henrique', sobrenome: 'Avancini', esporte: 'MTB' },
  { foto: '/brasil/pessoas/lucas-braathen.webp', nome: 'Lucas', sobrenome: 'Braathen', esporte: 'Esqui Alpino' },
  { foto: '/brasil/pessoas/leticia-bufoni.webp', nome: 'Letícia', sobrenome: 'Bufoni', esporte: 'Skate' },
  { foto: '/brasil/pessoas/carlos-burle.webp', nome: 'Carlos', sobrenome: 'Burle', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/pedro-caldas.webp', nome: 'Pedro', sobrenome: 'Caldas', esporte: 'Wakeboard' },
  { foto: '/brasil/pessoas/felipe-camargo.webp', nome: 'Felipe', sobrenome: 'Camargo', esporte: 'Escalada' },
  { foto: '/brasil/pessoas/joao-chinca.webp', nome: 'João', sobrenome: 'Chinca', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/lucas-chumbo.webp', nome: 'Lucas', sobrenome: 'Chumbo', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/sandro-dias.webp', nome: 'Sandro', sobrenome: 'Dias', esporte: 'Skate' },
  { foto: '/brasil/pessoas/italo-ferreira.webp', nome: 'Ítalo', sobrenome: 'Ferreira', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/lucas-fink.webp', nome: 'Lucas', sobrenome: 'Fink', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/arthur-fiu.webp', nome: 'Arthur', sobrenome: 'Fiu', esporte: 'Artes Marciais' },
  { foto: '/brasil/pessoas/rafael-goberna.webp', nome: 'Rafael', sobrenome: 'Goberna', esporte: 'Parapente' },
  { foto: '/brasil/pessoas/felipe-gustavo.webp', nome: 'Felipe', sobrenome: 'Gustavo', esporte: 'Skate' },
  { foto: '/brasil/pessoas/neymar-jr.webp', nome: 'Neymar', sobrenome: 'Jr.', esporte: 'Futebol' },
  { foto: '/brasil/pessoas/jucelino-junior.webp', nome: 'Jucelino', sobrenome: 'Junior', esporte: 'Cliff Diving' },
  { foto: '/brasil/pessoas/bruna-kajiya.webp', nome: 'Bruna', sobrenome: 'Kajiya', esporte: 'Kitesurfe' },
  { foto: '/brasil/pessoas/duda-lisboa.webp', nome: 'Duda', sobrenome: 'Lisboa', esporte: 'Vôlei de Praia' },
  { foto: '/brasil/pessoas/fernanda-maciel.webp', nome: 'Fernanda', sobrenome: 'Maciel', esporte: 'Corrida' },
  { foto: '/brasil/pessoas/lucas-moraes.webp', nome: 'Lucas', sobrenome: 'Moraes', esporte: 'Rali' },
  { foto: '/brasil/pessoas/diogo-moreira.webp', nome: 'Diogo', sobrenome: 'Moreira', esporte: 'MotoGP' },
  { foto: '/brasil/pessoas/ana-patricia.webp', nome: 'Ana', sobrenome: 'Patrícia', esporte: 'Vôlei de Praia' },
  { foto: '/brasil/pessoas/lucas-rabelo.webp', nome: 'Lucas', sobrenome: 'Rabelo', esporte: 'Skate' },
  { foto: '/brasil/pessoas/pedro-scooby.webp', nome: 'Pedro', sobrenome: 'Scooby', esporte: 'Surfe' },
  { foto: '/brasil/pessoas/paty-valente.webp', nome: 'Paty', sobrenome: 'Valente', esporte: 'Cliff Diving' },
  { foto: '/brasil/pessoas/gaules.webp', nome: 'Gaules', sobrenome: '', esporte: 'Esports' },
  { foto: '/brasil/pessoas/gabs.webp', nome: 'Gabs', sobrenome: '', esporte: 'Esports' },
  { foto: '/brasil/pessoas/l7nnon.webp', nome: 'L7nnon', sobrenome: '', esporte: 'Skate' },
  { foto: '/brasil/pessoas/endrick.webp', nome: 'Endrick', sobrenome: '', esporte: 'Futebol' },
]

function Brasil({ brasilRef, galeriaListaRef }) {
  const videoRef = useRef(null)
  const barraRef = useRef(null)
  
  // Refs do efeito de reveal da bandeira
  const bandeiraContainerRef = useRef(null)
  const reveladaRef = useRef(null)

  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [tempoAtual, setTempoAtual] = useState(0)
  const [mudo, setMudo] = useState(true)

  // Configuração do efeito de máscara estilo Lando Norris
  useEffect(() => {
    const container = bandeiraContainerRef.current
    const revelada = reveladaRef.current
    if (!container || !revelada) return

    const pos = { x: 0, y: 0, size: 0 }

    // Interpolação suave para seguir o cursor sem trancos
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

      // Abre a máscara suavemente
      gsap.to(pos, {
        size: 180, // Raio da abertura em pixels
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
      // Fecha a máscara ao retirar o mouse
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

  return (
    <div ref={brasilRef} className="brasil-cena">
      <div className="brasil-fundo" />

      {/* viewport com overflow oculto: só ele "corta" o conteúdo. dentro
          dele, brasil-scroll-content é UM bloco só (tela inicial + galeria)
          que desliza inteiro pra cima — texto, bandeiras, vídeo e fotos
          sobem juntos, como uma rolagem normal de página */}
      <div className="brasil-scroll-viewport">
        <div ref={galeriaListaRef} className="brasil-scroll-content">
          <div className="brasil-tela-inicial">
            <div className="brasil-conteudo">
              <h2 className="brasil-titulo">
                <span className="brasil-linha brasil-linha-escura">O Brasil</span>
                <span className="brasil-linha brasil-linha-escura">em todos os</span>
                <span className="brasil-linha brasil-linha-escura">esportes radicais</span>
                <span className="brasil-linha brasil-linha-clara">nossa cultura</span>
                <span className="brasil-linha brasil-linha-clara">também dá aaasas</span>
              </h2>
            </div>

            {/* Container com as duas bandeiras sobrepostas */}
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

          {/* logo abaixo da tela inicial, dentro do MESMO bloco que desliza:
              a galeria de 30 pessoas, uma do lado da outra, quebrando linha */}
          <div className="brasil-galeria-lista">
            {PESSOAS.map((pessoa, i) => (
              <div className="brasil-pessoa" key={i}>
                <img
                  src={pessoa.foto}
                  alt={`${pessoa.nome}${pessoa.sobrenome ? ` ${pessoa.sobrenome}` : ''}`}
                  className="brasil-pessoa-foto"
                  draggable={false}
                />
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
        </div>
      </div>
    </div>
  )
}

export default Brasil