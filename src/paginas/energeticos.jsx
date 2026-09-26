import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './energeticos.css'

gsap.registerPlugin(ScrollTrigger)

const FASE_QUEDA_FIM = 0.55

function Energeticos({
  quadroRef,
  quadroEsquerdaRef,
  quadroDireitaRef,
  energeticosProgressRef,
  revelacaoProgressRef,
  hoverCan2Ref,
  hoverCan3Ref,
  hoverCan4Ref,
}) {
  const rolagemRef = useRef(null)
  const pinRef = useRef(null)
  const botaoRef = useRef(null)
  const colunaEsquerdaRef = useRef(null)
  const colunaDireitaRef = useRef(null)
  const [pousou, setPousou] = useState(false)
  const [revelado, setRevelado] = useState(false)

  useEffect(() => {
    if (!rolagemRef.current || !pinRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rolagemRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        pin: pinRef.current,
        onUpdate: (self) => {

          const progressoQueda = Math.min(1, self.progress / FASE_QUEDA_FIM)

          const progressoRevelacao = Math.min(
            1,
            Math.max(0, (self.progress - FASE_QUEDA_FIM) / (1 - FASE_QUEDA_FIM))
          )

          if (energeticosProgressRef) {
            energeticosProgressRef.current = progressoQueda
          }
          if (revelacaoProgressRef) {
            revelacaoProgressRef.current = progressoRevelacao
          }

          const jaPousou = progressoQueda >= 0.98
          setPousou(jaPousou)
          if (!jaPousou && hoverCan2Ref) {
            hoverCan2Ref.current = false
          }

          const jaRevelado = progressoRevelacao >= 0.98
          setRevelado(jaRevelado)
          if (!jaRevelado) {
            if (hoverCan3Ref) hoverCan3Ref.current = false
            if (hoverCan4Ref) hoverCan4Ref.current = false
          }

          // textos: esquerda sai pra esquerda, direita sai pra direita
          gsap.set(colunaEsquerdaRef.current, {
            xPercent: progressoRevelacao * -130,
            opacity: 1 - progressoRevelacao,
          })
          gsap.set(colunaDireitaRef.current, {
            xPercent: progressoRevelacao * 130,
            opacity: 1 - progressoRevelacao,
          })

          gsap.set(quadroEsquerdaRef.current, {
            xPercent: progressoRevelacao * -115,
            opacity: progressoRevelacao,
          })
          gsap.set(quadroDireitaRef.current, {
            xPercent: progressoRevelacao * 115,
            opacity: progressoRevelacao,
          })
        },
      })
    }, rolagemRef)

    return () => ctx.revert()
  }, [energeticosProgressRef, revelacaoProgressRef, hoverCan2Ref, hoverCan3Ref, hoverCan4Ref])


  const aoClicarBotao = () => {
    gsap.fromTo(botaoRef.current, { scale: 0.94 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
  }

  return (
    <section className="energeticos">
      <div ref={rolagemRef} className="rolagem-quadro">
        <div ref={pinRef} className="energeticos-pin">
          <div ref={colunaEsquerdaRef} className="coluna coluna-esquerda">
            <div>
              <h1 className="titulo-produto">
                RED BULL
                <br />
                ENERGY
              </h1>
              <p className="subtitulo">250ml Edição Especial</p>
            </div>

            <div className="ingredientes">
              <h4>INGREDIENTES</h4>
              <p>Cafeína, Taurina, Vitaminas do complexo B, Açúcares</p>
            </div>
          </div>
          <div className="pilha-quadros">
            <div
              ref={quadroEsquerdaRef}
              className="quadro-secundario esquerda"
              onMouseEnter={() => {
                if (revelado && hoverCan3Ref) hoverCan3Ref.current = true
              }}
              onMouseLeave={() => {
                if (hoverCan3Ref) hoverCan3Ref.current = false
              }}
            >
              <div className="foto-polaroid" />
              <p className="legenda-polaroid">Red Bull Sugarfree</p>
            </div>
            <div
              ref={quadroDireitaRef}
              className="quadro-secundario direita"
              onMouseEnter={() => {
                if (revelado && hoverCan4Ref) hoverCan4Ref.current = true
              }}
              onMouseLeave={() => {
                if (hoverCan4Ref) hoverCan4Ref.current = false
              }}
            >
              <div className="foto-polaroid" />
              <p className="legenda-polaroid">Red Bull Red Edition</p>
            </div>
            <div
              ref={quadroRef}
              className={`quadro-menu${pousou ? ' pousou' : ''}`}
              onMouseEnter={() => {

                if (pousou && hoverCan2Ref) hoverCan2Ref.current = true
              }}
              onMouseLeave={() => {
                if (hoverCan2Ref) hoverCan2Ref.current = false
              }}
            >
              <div className="foto-polaroid">
                <div className="camada-hover">
                  <img
                    src=""
                    alt=""
                    className="cantor-imagem canto-superior-direito"
                  />
                  <img
                    src=""
                    alt=""
                    className="cantor-imagem canto-inferior-esquerdo"
                  />
                </div>
              </div>
              <p className="legenda-polaroid">Red Bull Energy</p>
            </div>
          </div>

          <div ref={colunaDireitaRef} className="coluna coluna-direita">
            <div>
              <h4>SOBRE A BEBIDA</h4>
              <p>
                Red Bull Energy Drink é apreciado no mundo todo por atletas de
                elite, profissionais dinâmicos, estudantes ativos e motoristas
                em viagens longas.
              </p>
            </div>

            <button ref={botaoRef} className="botao-girar" onClick={aoClicarBotao}>
              Girar Red Bull
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Energeticos