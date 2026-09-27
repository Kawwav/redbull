import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Comeco from './paginas/comeco.jsx'
import Energeticos from './paginas/energeticos.jsx'
import Corrida from './paginas/corrida.jsx'
import Lata3D from './componentes/Lata3D.jsx'
import AdaoRedbull3D from './componentes/AdaoRedbull3D.jsx'
import Footer from './componentes/footer.jsx'

gsap.registerPlugin(ScrollTrigger)

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
  const descidaCartoesRef = useRef(0)
  const redbullRef = useRef(null)

  // modelo 3d do Adão viajando até o footer
  const redbullAdaoInicioRef = useRef(null)
  const redbullAdaoAlvoFooterRef = useRef(null)
  const redbullAdaoProgressoRef = useRef(0)

  useGSAP(() => {
    const alvo = redbullAdaoAlvoFooterRef.current
    if (!alvo) return

    const trigger = ScrollTrigger.create({
      trigger: alvo,
      start: 'top bottom', // começa a "puxar" o modelo quando o footer entra na tela
      end: 'top 30%', // termina quando o alvo já está perto do topo da tela
      scrub: 1,
      onUpdate: (self) => {
        redbullAdaoProgressoRef.current = self.progress
      },
    })

    ScrollTrigger.refresh()

    return () => trigger.kill()
  }, [])

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
        descidaCartoesRef={descidaCartoesRef}
      />

      <Corrida redbullAnchorRef={redbullAdaoInicioRef} />

      <Footer redbullAlvoRef={redbullAdaoAlvoFooterRef} />

      <AdaoRedbull3D
        inicioRef={redbullAdaoInicioRef}
        fimRef={redbullAdaoAlvoFooterRef}
        progressoRef={redbullAdaoProgressoRef}
      />

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
          descidaCartoesRef={descidaCartoesRef}
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