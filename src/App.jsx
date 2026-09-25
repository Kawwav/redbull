import { useRef, useState } from 'react'
import Comeco from './paginas/comeco.jsx'
import Energeticos from './paginas/energeticos.jsx'
import Corrida from './paginas/corrida.jsx'
import Lata3D from './componentes/Lata3D.jsx'

function App() {
  const [mostrarLata, setMostrarLata] = useState(false)
  const scrollProgressRef = useRef(0)
  const energeticosProgressRef = useRef(0)
  const revelacaoProgressRef = useRef(0)
  const quadroRef = useRef(null)
  const quadroEsquerdaRef = useRef(null)
  const quadroDireitaRef = useRef(null)
  const hoverCan2Ref = useRef(false)
  const hoverCan3Ref = useRef(false)
  const hoverCan4Ref = useRef(false)
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
        quadroEsquerdaRef={quadroEsquerdaRef}
        quadroDireitaRef={quadroDireitaRef}
        energeticosProgressRef={energeticosProgressRef}
        revelacaoProgressRef={revelacaoProgressRef}
        hoverCan2Ref={hoverCan2Ref}
        hoverCan3Ref={hoverCan3Ref}
        hoverCan4Ref={hoverCan4Ref}
      />

      <Corrida />

      {mostrarLata && (
        <Lata3D
          scrollProgressRef={scrollProgressRef}
          energeticosProgressRef={energeticosProgressRef}
          revelacaoProgressRef={revelacaoProgressRef}
          quadroRef={quadroRef}
          quadroEsquerdaRef={quadroEsquerdaRef}
          quadroDireitaRef={quadroDireitaRef}
          hoverCan2Ref={hoverCan2Ref}
          hoverCan3Ref={hoverCan3Ref}
          hoverCan4Ref={hoverCan4Ref}
        />
      )}

      {mostrarLata && (
        <div ref={redbullRef} className="redbull">
          <img src="/imagens/redbull.png" alt="Red Bull" className="imagem" />
        </div>
      )}
    </>
  )
}

export default App
