import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './energeticos.css'

gsap.registerPlugin(ScrollTrigger)

const FASE_QUEDA_FIM = 0.55

// cor de fundo (--cor-hover) de cada card: a das latas antigas e a das novas
// que entram pelo teto. Ajuste os hex aqui se quiser outras cores.
const CORES_CARTOES_ANTIGOS = {
  central: '#1a56db', // can_2_blue
  esquerda: '#2f9e44', // can_3_green
  direita: '#ffb385', // can_4_peach
}
const CORES_CARTOES_NOVOS = {
  central: '#c81c14', // can_5_red
  esquerda: '#f2b134', // can_6_summer
  direita: '#ffd60a', // can_7_yellow
}
const DURACAO_TROCA_COR_CARTAO = 0.9

function Energeticos({
  quadroRef,
  quadroEsquerdaRef,
  quadroDireitaRef,
  energeticosProgressRef,
  revelacaoProgressRef,
  hoverCan2Ref,
  hoverCan3Ref,
  hoverCan4Ref,
  descidaCartoesRef,
}) {
  const rolagemRef = useRef(null)
  const pinRef = useRef(null)
  const botaoRef = useRef(null)
  const colunaEsquerdaRef = useRef(null)
  const colunaDireitaRef = useRef(null)
  const [pousou, setPousou] = useState(false)
  const [revelado, setRevelado] = useState(false)
  const [cartoesEscondidos, setCartoesEscondidos] = useState(false)

  useGSAP(
    () => {
      if (!rolagemRef.current || !pinRef.current) return

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

      ScrollTrigger.refresh()
    },
    {
      scope: rolagemRef,
      dependencies: [energeticosProgressRef, revelacaoProgressRef, hoverCan2Ref, hoverCan3Ref, hoverCan4Ref],
    }
  )


  const aoClicarBotao = () => {
    gsap.fromTo(botaoRef.current, { scale: 0.94 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
  }

  const animarCoresCartoes = (paraNovas) => {
    const cores = paraNovas ? CORES_CARTOES_NOVOS : CORES_CARTOES_ANTIGOS
    if (quadroRef.current) {
      gsap.to(quadroRef.current, {
        '--cor-hover': cores.central,
        duration: DURACAO_TROCA_COR_CARTAO,
        ease: 'power2.inOut',
      })
    }
    if (quadroEsquerdaRef.current) {
      gsap.to(quadroEsquerdaRef.current, {
        '--cor-hover': cores.esquerda,
        duration: DURACAO_TROCA_COR_CARTAO,
        ease: 'power2.inOut',
      })
    }
    if (quadroDireitaRef.current) {
      gsap.to(quadroDireitaRef.current, {
        '--cor-hover': cores.direita,
        duration: DURACAO_TROCA_COR_CARTAO,
        ease: 'power2.inOut',
      })
    }
  }

  const aoClicarSetaDireita = () => {
    if (!descidaCartoesRef || cartoesEscondidos) return
    setCartoesEscondidos(true)
    gsap.to(descidaCartoesRef, {
      current: 1,
      duration: 0.9,
      ease: 'power2.in',
    })
    animarCoresCartoes(true)
  }

  const aoClicarSetaEsquerda = () => {
    if (!descidaCartoesRef || !cartoesEscondidos) return
    setCartoesEscondidos(false)
    gsap.to(descidaCartoesRef, {
      current: 0,
      duration: 0.9,
      ease: 'power2.out',
    })
    animarCoresCartoes(false)
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
              <div className="foto-polaroid">
                <div className="estrela-fundo" />
              </div>
              <div className="legenda-cartao">
                <span className="nome-lata">Red Bull Sugarfree</span>
                <span className="mais-cartao">+</span>
              </div>
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
              <div className="foto-polaroid">
                <div className="estrela-fundo" />
              </div>
              <div className="legenda-cartao">
                <span className="nome-lata">Red Bull Red Edition</span>
                <span className="mais-cartao">+</span>
              </div>
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
                <div className="estrela-fundo" />
                <div className="imagem-fundo" />
              </div>
              <div className="legenda-cartao">
                <span className="nome-lata">Red Bull Energy</span>
                <span className="mais-cartao">+</span>
              </div>
            </div>

            <div className="navegacao-cartoes">
              <button
                type="button"
                className="seta-cartao seta-esquerda"
                aria-label="Cartão anterior"
                onClick={aoClicarSetaEsquerda}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="seta-cartao seta-direita"
                aria-label="Próximo cartão"
                onClick={aoClicarSetaDireita}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
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
              Ver todos os Red Bulls
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Energeticos