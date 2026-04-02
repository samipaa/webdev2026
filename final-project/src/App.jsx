import './App.css'
import Banner from './components/Banner.jsx'
import Sidebar from './components/Sidebar.jsx'
import Main from './components/Main.jsx'
import Watermark from './components/Watermark.jsx'

function App() {
  return (
    <div className="site-shell">
      <div className="page-frame">
        <div className="frame-top" aria-hidden="true" />
        <Banner />
        <main className="content-grid">
          <Sidebar />
          <Main />
        </main>
        <Watermark />
      </div>
    </div>
  )
}

export default App
