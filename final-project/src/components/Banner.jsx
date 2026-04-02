import topBanner from '../../originalPage/img/top.jpg'

function Banner() {
  return (
    <header className="banner">
      <a
        className="banner__link"
        href="http://www.kansiviritys.com"
        target="_blank"
        rel="noreferrer"
      >
        <img
          className="banner__image"
          src={topBanner}
          alt="Kansiviritys J.Kosunen"
        />
      </a>
    </header>
  )
}

export default Banner
