import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Banner from './components/Banner.jsx'
import Sidebar from './components/Sidebar.jsx'
import Main from './components/Main.jsx'
import Watermark from './components/Watermark.jsx'
import Contact from './components/Contact.jsx'

function App() {
  return (
    <BrowserRouter>
    <div className="site-shell">
      <div className="page-frame">
        <div className="frame-top" />
        <Banner />
        <main className="content-grid">
          <Sidebar />
           <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/yhteystiedot" element={<Contact />} />
            </Routes>
        </main>
        <Watermark />
      </div>
    </div>
    </BrowserRouter>
  )
}

{/* korjaa indent */}

export default App
