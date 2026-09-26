import './footer.css'
const FOOTER_NUVENS = [
  { src: '/imagens/nuvem2.webp', width: '22vw', left: '-6%', top: '-38%' },
  { src: '/imagens/nuvem3.webp', width: '26vw', left: '10%', top: '-68%' },
  { src: '/imagens/nuvem1.webp', width: '24vw', left: '26%', top: '-58%'},
  { src: '/imagens/nuvem2.webp', width: '27vw', left: '42%', top: '-64%' },
  { src: '/imagens/nuvem3.webp', width: '22vw', left: '58%', top: '-78%' },
  { src: '/imagens/nuvem1.webp', width: '25vw', left: '74%', top: '-58%'},
  { src: '/imagens/nuvem2.webp', width: '23vw', left: '61%', top: '-38%' },
]


const NAV_PRINCIPAL = ['Produtos', 'Sobre Nós', 'Atletas', 'F1 Racing', 'Novidades', 'Contato']
const REDES_SOCIAIS = ['Instagram', 'YouTube', 'TikTok']

function Footer({ redbullAlvoRef }) {
  const ano = new Date().getFullYear()

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

        <div className="footer-listas-secundarias">
          <div className="footer-lista-secundaria">
            <ul>
              {REDES_SOCIAIS.map((item) => (
                <li key={item}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-cta">
          <h3>Vamos falar sobre sua próxima jogada</h3>
          <a href="">contato@redbull.com</a>
        </div>
      </div>

      <div ref={redbullAlvoRef} className="footer-adao-alvo" aria-hidden="true" />

      <div className="footer-rodape">
      </div>
    </footer>
  )
}

export default Footer