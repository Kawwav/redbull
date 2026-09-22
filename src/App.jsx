import { useRef, useState } from 'react'
import Comeco from './paginas/comeco.jsx'
import Energeticos from './paginas/energeticos.jsx'
import Lata3D from './componentes/Lata3D.jsx'

function App() {
  const [mostrarLata, setMostrarLata] = useState(false)

  // progresso 0->1 da primeira seção (vídeo -> logo -> lata sobe e gira)
  const scrollProgressRef = useRef(0)
  // progresso 0->1 da fase 1 da energeticos (lata dá mortal e cai dentro do quadrado)
  const energeticosProgressRef = useRef(0)
  // progresso 0->1 da fase 2 da energeticos (textos saem pros lados, lata
  // afunda/some, e os 2 quadrados escondidos atrás do quadro-menu se revelam)
  const revelacaoProgressRef = useRef(0)
  // referência do quadrado (futuro botão de menu/carrinho) dentro da energeticos
  const quadroRef = useRef(null)
  // true enquanto o mouse está em cima do quadro-menu (só passa a valer depois
  // que a lata 2 (can_2_blue) já pousou lá dentro — ver .pousou na energeticos)
  const hoverCan2Ref = useRef(false)
  // a imagem do redbull precisa viver FORA da .comeco: enquanto pinada, a .comeco
  // vira position:fixed, e todo position:fixed cria seu próprio stacking context —
  // isso prendia o z-index do redbull, que nunca conseguia ficar na frente do modelo 3D
  const redbullRef = useRef(null)

  return (
    <>
      <Comeco
        mostrarLata={mostrarLata}
        aoMostrarLata={() => setMostrarLata(true)}
        scrollProgressRef={scrollProgressRef}
        redbullRef={redbullRef}
      />

      <Energeticos
        quadroRef={quadroRef}
        energeticosProgressRef={energeticosProgressRef}
        revelacaoProgressRef={revelacaoProgressRef}
        hoverCan2Ref={hoverCan2Ref}
      />

      {/* fica montado o tempo todo a partir daqui, pra lata nunca "resetar" ao trocar de seção */}
      {mostrarLata && (
        <Lata3D
          scrollProgressRef={scrollProgressRef}
          energeticosProgressRef={energeticosProgressRef}
          revelacaoProgressRef={revelacaoProgressRef}
          quadroRef={quadroRef}
          hoverCan2Ref={hoverCan2Ref}
        />
      )}

      {/* irmão do modelo 3D no mesmo nível (fora da .comeco), assim o z-index dele
          é comparado direto com o do .modelo — precisa ficar por cima */}
      {mostrarLata && (
        <div ref={redbullRef} className="redbull">
          <img src="/imagens/redbull.png" alt="Red Bull" className="imagem" />
        </div>
      )}
    </>
  )
}

export default App