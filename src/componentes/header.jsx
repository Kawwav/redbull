import './header.css'

function Header({ visivel }) {
  const menuItems = [
    { label: 'Energy Drinks', dropdown: true },
    { label: 'Eventos', dropdown: false },
    { label: 'Atletas', dropdown: false },
    { label: 'Red Bull TV', dropdown: true },
  ]

  return (
    <header className={`cabecalho${visivel ? ' visivel' : ''}`}>
      <div className="chao">
        <img src="/imagens/redbull-logo.svg" alt="Red Bull" className="logo" />
      </div>

      <nav className="navegacao">
        <ul className="lista">
          {menuItems.map((item) => (
            <li key={item.label} className="item">
              <a href="#" className="link">
                {item.label}
                {item.dropdown && (
                  <svg
                    className="seta"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M1.5 3L5 6.5L8.5 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header