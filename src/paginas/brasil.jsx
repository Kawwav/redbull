import './brasil.css'

function Brasil({ brasilRef }) {
  return (
    <div ref={brasilRef} className="brasil-cena">
      <div className="brasil-fundo" />

      <div className="brasil-conteudo">
        <h2 className="brasil-titulo">
          O Brasil em todos os esportes radicais
          <span className="brasil-linha2">nossa cultura também dá aaasas</span>
        </h2>
      </div>
    </div>
  )
}

export default Brasil