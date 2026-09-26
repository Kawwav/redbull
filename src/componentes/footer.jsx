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
const REDES_SOCIAIS = [
  { nome: 'Instagram', imagem: '/redes/instagram.png' },
  { nome: 'YouTube', imagem: '/redes/youtube.png' },
  { nome: 'TikTok', imagem: '/redes/tiktok.png' },
]

function Footer({ redbullAlvoRef }) {
  const ano = new Date().getFullYear()

  // mesma técnica do trabalhos.jsx: uma caixa fixa que só se move/aparece
  // (não troca de imagem sozinha) + duas imagens dentro dela que se
  // revezam subindo/descendo do "chão" a cada troca de rede social
  const listaRedesRef = useRef(null)
  const caixaRedesRef = useRef(null)
  const imagemRedesRefA = useRef(null)
  const imagemRedesRefB = useRef(null)
  const imagemRedesAtivaRef = useRef(null)

  // move a caixa pra acompanhar o cursor dentro do container das redes
  const aoMoverMouseListaRedes = (evento) => {
    const container = listaRedesRef.current
    const caixa = caixaRedesRef.current
    if (!container || !caixa) return
    const retangulo = container.getBoundingClientRect()
    caixa.style.left = `${evento.clientX - retangulo.left}px`
    caixa.style.top = `${evento.clientY - retangulo.top}px`
  }

  // ao passar o mouse numa rede social: a caixa fica parada, só a imagem
  // atual sobe e some enquanto a nova sobe do chão e ocupa o lugar
  const aoEntrarRedeSocial = (src) => {
    const caixa = caixaRedesRef.current
    const imgA = imagemRedesRefA.current
    const imgB = imagemRedesRefB.current
    if (!caixa || !imgA || !imgB) return

    caixa.classList.add('footer-rede-hover-caixa--ativa')

    const atual = imagemRedesAtivaRef.current

    if (!atual) {
      // primeira imagem: só aparece no lugar
      imgA.src = src
      imgA.classList.remove('footer-rede-hover-imagem--saindo', 'footer-rede-hover-imagem--entrando')
      imgA.classList.add('footer-rede-hover-imagem--ativa')
      imagemRedesAtivaRef.current = imgA
      return
    }

    const proxima = atual === imgA ? imgB : imgA

    // a imagem atual sobe e desaparece
    atual.classList.remove('footer-rede-hover-imagem--ativa')
    atual.classList.add('footer-rede-hover-imagem--saindo')

    // a próxima imagem parte de baixo (do "chão"), ainda invisível
    proxima.src = src
    proxima.classList.remove('footer-rede-hover-imagem--saindo')
    proxima.classList.add('footer-rede-hover-imagem--entrando')

    // força o navegador a aplicar o estado "entrando" antes de animar até "ativa"
    void proxima.offsetWidth

    proxima.classList.remove('footer-rede-hover-imagem--entrando')
    proxima.classList.add('footer-rede-hover-imagem--ativa')

    imagemRedesAtivaRef.current = proxima
  }

  // esconde a caixa (e a imagem ativa) ao sair da lista de redes por completo
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
              <li key={item}><a href="#">{item}</a></li>
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