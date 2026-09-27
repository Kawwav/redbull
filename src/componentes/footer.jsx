import { useRef } from 'react'
import './footer.css'
const FOOTER_NUVENS = [
  { src: '/imagens/nuvem2.webp', width: '22vw', left: '-6%', top: '-38%' },
  { src: '/imagens/nuvem3.webp', width: '26vw', left: '10%', top: '-68%' },
  { src: '/imagens/nuvem1.webp', width: '24vw', left: '26%', top: '-58%'},
  { src: '/imagens/nuvem2.webp', width: '27vw', left: '42%', top: '-64%' },
  { src: '/imagens/nuvem3.webp', width: '22vw', left: '58%', top: '-78%' },
  { src: '/imagens/nuvem1.webp', width: '25vw', left: '74%', top: '-58%'},
  { src: '/imagens/nuvem2.webp', width: '23vw', left: '61%', top: '-52%' },
]


const NAV_PRINCIPAL = ['Produtos', 'Sobre Nós', 'Atletas', 'F1 Racing', 'Novidades', 'Contato']

const FOOTER_DESENHOS = [
  { src: '/fundoenergeticos/desenho1.png', width: '13vw', top: '18%', direcao: 'esquerda' },
  { src: '/fundoenergeticos/desenho2.png', width: '15vw', top: '52%', direcao: 'direita' },
  { src: '/fundoenergeticos/desenho3.png', width: '14vw', top: '32%', direcao: 'esquerda' },
  { src: '/fundoenergeticos/desenho4.png', width: '12vw', top: '62%', direcao: 'direita' },
  { src: '/fundoenergeticos/desenho5.png', width: '14vw', top: '12%', direcao: 'esquerda' },
  { src: '/fundoenergeticos/desenho6.png', width: '16vw', top: '42%', direcao: 'esquerda' }, // tanto faz
]

const DURACAO_DESENHO = 22
const INTERVALO_ENTRE_DESENHOS = 3.4

const REDES_SOCIAIS = [
  { nome: 'Instagram', imagem: '/redes/instagram.png' },
  { nome: 'YouTube', imagem: '/redes/youtube.png' },
  { nome: 'TikTok', imagem: '/redes/tiktok.png' },
]

function Footer({ redbullAlvoRef }) {
  const ano = new Date().getFullYear()

  const listaRedesRef = useRef(null)
  const caixaRedesRef = useRef(null)
  const imagemRedesRefA = useRef(null)
  const imagemRedesRefB = useRef(null)
  const imagemRedesAtivaRef = useRef(null)

  const aoMoverMouseListaRedes = (evento) => {
    const container = listaRedesRef.current
    const caixa = caixaRedesRef.current
    if (!container || !caixa) return
    const retangulo = container.getBoundingClientRect()
    caixa.style.left = `${evento.clientX - retangulo.left}px`
    caixa.style.top = `${evento.clientY - retangulo.top}px`
  }

  const aoEntrarRedeSocial = (src) => {
    const caixa = caixaRedesRef.current
    const imgA = imagemRedesRefA.current
    const imgB = imagemRedesRefB.current
    if (!caixa || !imgA || !imgB) return

    caixa.classList.add('footer-rede-hover-caixa--ativa')

    const atual = imagemRedesAtivaRef.current

    if (!atual) {
      imgA.src = src
      imgA.classList.remove('footer-rede-hover-imagem--saindo', 'footer-rede-hover-imagem--entrando')
      imgA.classList.add('footer-rede-hover-imagem--ativa')
      imagemRedesAtivaRef.current = imgA
      return
    }

    const proxima = atual === imgA ? imgB : imgA

    atual.classList.remove('footer-rede-hover-imagem--ativa')
    atual.classList.add('footer-rede-hover-imagem--saindo')

    proxima.src = src
    proxima.classList.remove('footer-rede-hover-imagem--saindo')
    proxima.classList.add('footer-rede-hover-imagem--entrando')

    void proxima.offsetWidth

    proxima.classList.remove('footer-rede-hover-imagem--entrando')
    proxima.classList.add('footer-rede-hover-imagem--ativa')

    imagemRedesAtivaRef.current = proxima
  }
  const aoSairListaRedes = () => {
    const caixa = caixaRedesRef.current
    if (caixa) caixa.classList.remove('footer-rede-hover-caixa--ativa')
    const atual = imagemRedesAtivaRef.current
    if (atual) {
      atual.classList.remove(
        'footer-rede-hover-imagem--ativa',
        'footer-rede-hover-imagem--entrando',
        'footer-rede-hover-imagem--saindo'
      )
    }
    imagemRedesAtivaRef.current = null
  }

  return (
    <footer className="footer">
      <div className="footer-desenhos" aria-hidden="true">
        {FOOTER_DESENHOS.map((desenho, indice) => (
          <img
            key={indice}
            src={desenho.src}
            alt=""
            className="footer-desenho"
            style={{
              width: desenho.width,
              top: desenho.top,
              animationName: desenho.direcao === 'direita' ? 'footer-desenho-atravessar-inverso' : 'footer-desenho-atravessar',
              animationDuration: `${DURACAO_DESENHO}s`,
              animationDelay: `${indice * INTERVALO_ENTRE_DESENHOS - DURACAO_DESENHO}s`,
            }}
            draggable={false}
          />
        ))}
      </div>

      <div className="footer-nuvens" aria-hidden="true">
        {FOOTER_NUVENS.map((nuvem, indice) => (
          <img
            key={indice}
            src={nuvem.src}
            alt=""
            className="footer-nuvem"
            style={{ width: nuvem.width, left: nuvem.left, top: nuvem.top }}
            draggable={false}
          />
        ))}
      </div>

      <div className="footer-top">
        <nav className="footer-nav-principal" aria-label="Navegação principal do rodapé">
          <ul>
            {NAV_PRINCIPAL.map((item) => (
              <li key={item}>
                <a href="#">
                  <span className="footer-nav-texto">
                    <span>{item}</span>
                    <span className="footer-nav-texto-hover">{item}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-cta">
          <h3>Vamos falar sobre sua próxima jogada</h3>
          <a href="">contato@redbull.com</a>

          <div className="footer-listas-secundarias">
            <div
              className="footer-lista-secundaria footer-lista-redes"
              ref={listaRedesRef}
              onMouseMove={aoMoverMouseListaRedes}
              onMouseLeave={aoSairListaRedes}
            >
              <ul>
                {REDES_SOCIAIS.map((rede) => (
                  <li key={rede.nome} onMouseEnter={() => aoEntrarRedeSocial(rede.imagem)}>
                    <a href="#">{rede.nome}</a>
                  </li>
                ))}
              </ul>

              <div className="footer-rede-hover-caixa" ref={caixaRedesRef}>
                <img
                  src={REDES_SOCIAIS[0].imagem}
                  alt=""
                  className="footer-rede-hover-imagem"
                  ref={imagemRedesRefA}
                />
                <img
                  src={REDES_SOCIAIS[0].imagem}
                  alt=""
                  className="footer-rede-hover-imagem"
                  ref={imagemRedesRefB}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={redbullAlvoRef} className="footer-adao-alvo" aria-hidden="true" />

      <div className="footer-rodape">
      </div>
    </footer>
  )
}

export default Footer