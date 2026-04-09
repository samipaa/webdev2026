import trophy from '../../originalPage/img/trophy.jpg'
import dot from '../../originalPage/img/dot.png'

const tyot = [
'Kilpamoottoreiden kansityöt',
'Siviiliautojen sylinterinkannen kunnostukset',
'Kanavien, venttiilien ja palotilojen muotoilu sekä muutostyöt',
'Kauttamme myös turboahtimet ja alumiinikansien hitsaukset',
'Opel CIH moottorien rullanokkakannet, kysy päivän hinta',
'Historic-luokan Opel & BMW kansityöt (kysy myös muihin merkkeihin)',
'Turbomoottoreiden suunnittelu (kokonaisuus)',
'Virtausmittaukset, suoritetaan SUPERFLOW 110E - virtauspenkissä',
'Nykyaikaiset laitteet ja työtavat',
'Vuosien ammattitaito',
'Hintaan sisältyy vinkkejä ja konsultaatioapua koskien moottorinviritystä!',
]

function Main() {
  return (
    <section className="main">
      <div className="main__inner">
          <h1>KANSIVIRITYSTÄ AMMATTITAIDOLLA</h1>
          <b>
            HUOM! Teemme myös siviiliautojen sylinterinkannen kunnostukset.
          </b>

        <p>
Kansityöt vuosien kokemuksella. Kanavien muutokset, täytöt, ohjurit, lautaspintojen, palotilojen muotoilu jne. Myös moottoripyörät ja diesel-moottorit. Ammattitaitoinen yritys joka on valmis auttamaan oli ongelmasi pieni tai suuri. Kesällä 2009 uusittu laitekanta. Teemme läheistä yhteistyötä moottorialan ammattilaisten kanssa, joten kun tarvitset apua ota yhteyttä.
        </p>

          <ul>
            {tyot.map((item) => (
              <li key={item}>
                <img src={dot} alt="" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

        <h2>
          <img src={trophy} alt="" />
Koko vuoden 2008 SM-Street B-ryhmän mitallikolmikko käytti palvelujamme!
        </h2>
      </div>
    </section>
  )
}

export default Main
