import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import facebookIcon from '../../originalPage/img/facebook.png'
import menuHeading from '../../originalPage/img/menu_01.jpg'
import yritys from '../../originalPage/img/menu_02.jpg'
import yritysHover from '../../originalPage/img/menu_02-over.jpg'
import huollot from '../../originalPage/img/menu_03.jpg'
import huollotHover from '../../originalPage/img/menu_03-over.jpg'
import kilpakannet from '../../originalPage/img/menu_04.jpg'
import kilpakannetHover from '../../originalPage/img/menu_04-over.jpg'
import galleria from '../../originalPage/img/menu_05.jpg'
import galleriaHover from '../../originalPage/img/menu_05-over.jpg'
import referenssit from '../../originalPage/img/menu_06.jpg'
import referenssitHover from '../../originalPage/img/menu_06-over.jpg'
import yhteistyossa from '../../originalPage/img/menu_07.jpg'
import yhteistyossaHover from '../../originalPage/img/menu_07-over.jpg'
import yhteystiedot from '../../originalPage/img/menu_08.jpg'
import yhteystiedotHover from '../../originalPage/img/menu_08-over.jpg'

// ok looks good enough

const buttons = [
  {
    alt: 'Yritys',
    to: '/',
    defaultSrc: yritys,
    hoverSrc: yritysHover,
  },
  {
    alt: 'Kansihuollot',
    href: '/',
    defaultSrc: huollot,
    hoverSrc: huollotHover,
  },
  {
    alt: 'Kilpakannet',
    href: '/',
    defaultSrc: kilpakannet,
    hoverSrc: kilpakannetHover,
  },
  {
    alt: 'Galleria',
    href: '/',
    defaultSrc: galleria,
    hoverSrc: galleriaHover,
  },
  {
    alt: 'Referenssit',
    href: '/',
    defaultSrc: referenssit,
    hoverSrc: referenssitHover,
  },
  {
    alt: 'Yhteistyössä',
    href: '/',
    defaultSrc: yhteistyossa,
    hoverSrc: yhteistyossaHover,
  },
  {
    alt: 'Yhteystiedot',
    to: '/yhteystiedot',
    defaultSrc: yhteystiedot,
    hoverSrc: yhteystiedotHover,
  },
]

function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <aside className="sidebar">
      <img className="sidebar__button" src={menuHeading} alt="" />

      <nav className="sidebar__nav">
        {buttons.map((item) => {
          const isHovered = hoveredItem === item.alt

          return (
            <Link
              key={item.alt}
              to={item.to}
              onFocus={() => setHoveredItem(item.alt)}
              onBlur={() => setHoveredItem(null)}
              onMouseEnter={() => setHoveredItem(item.alt)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <img
                className="sidebar__button"
                src={isHovered ? item.hoverSrc : item.defaultSrc}
                alt={item.alt}
              />
            </Link>
          )
        })}
      </nav>

      <section className="sidebar__contact">
        <p className="sidebar__facebook">
          <img src={facebookIcon} alt="" />
          <a
            href="https://www.facebook.com/pages/Kansiviritys-JKosunen/579460078763141?ref=ts&fref=ts"
            target="_blank"
            rel="noreferrer"
          >
            Nyt myös Facebookista!
          </a>
        </p>

        <address className="sidebar__address">
          <strong>Kansiviritys J.Kosunen</strong>
          <span>Lempeläntie 4</span>
          <span>71310 Vehmersalmi</span>
          <span>s-posti: kansiviritys@gmail.com</span>
        </address>

        <div className="sidebar__ajat">
          <strong>YHTEYDENOTOT</strong>
          <span>Arkisin Klo 9 - 17.00</span>
          <span>p. 0400 - 510 138</span>
        </div>
      </section>
    </aside>
  )
}

export default Sidebar
