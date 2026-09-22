import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './energeticos.css'

gsap.registerPlugin(ScrollTrigger)

// a seção tem 2 fases dentro do mesmo scroll pinado:
// 1) 0 -> FASE_QUEDA_FIM: a lata cai e pousa no quadro-menu (igual antes)
// 2) FASE_QUEDA_FIM -> 1: os textos saem pros lados, a lata afunda/some e os
//    2 quadrados escondidos atrás do quadro-menu se revelam pra esquerda/direita
const FASE_QUEDA_FIM = 0.55

function Energeticos({ quadroRef, energeticosProgressRef, revelacaoProgressRef, hoverCan2Ref }) {
  const rolagemRef = useRef(null)
  const pinRef = useRef(null)
  const botaoRef = useRef(null)
  const colunaEsquerdaRef = useRef(null)
  const colunaDireitaRef = useRef(null)
  const quadroEsquerdaRef = useRef(null)
  const quadroDireitaRef = useRef(null)
  const [pousou, setPousou] = useState(false)

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
          // fase 1 (0 -> 1): a queda/pouso da lata, igual antes — só que agora
          // ocupa só a primeira parte do scroll total da seção
          const progressoQueda = Math.min(1, self.progress / FASE_QUEDA_FIM)
          // fase 2 (0 -> 1): textos saindo, lata sumindo, quadrados se revelando
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

          // textos: esquerda sai pra esquerda, direita sai pra direita
          gsap.set(colunaEsquerdaRef.current, {
            xPercent: progressoRevelacao * -130,
            opacity: 1 - progressoRevelacao,
          })
          gsap.set(colunaDireitaRef.current, {
            xPercent: progressoRevelacao * 130,
            opacity: 1 - progressoRevelacao,
          })

          // quadrados escondidos atrás do quadro-menu: saem de trás dele e se
          // alinham do lado, lado a lado, como um carrossel
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
  }, [energeticosProgressRef, revelacaoProgressRef, hoverCan2Ref])

  // pequeno "aceno" no botão ao clicar, só decorativo
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

          {/* pilha: o quadro-menu (alvo da queda da lata) na frente, e 2
              quadrados escondidos atrás que se revelam pros lados na fase 2 */}
          <div className="pilha-quadros">
            <div ref={quadroEsquerdaRef} className="quadro-secundario esquerda" />
            <div ref={quadroDireitaRef} className="quadro-secundario direita" />
            <div
              ref={quadroRef}
              className={`quadro-menu${pousou ? ' pousou' : ''}`}
              onMouseEnter={() => {
                // só reage ao hover depois que a lata (can_2_blue) já pousou ali dentro
                if (pousou && hoverCan2Ref) hoverCan2Ref.current = true
              }}
              onMouseLeave={() => {
                if (hoverCan2Ref) hoverCan2Ref.current = false
              }}
            >
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