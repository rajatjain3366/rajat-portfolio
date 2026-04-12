import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Gallery from './pages/Gallery'
import Certificates from './pages/Certificates'
import Blog from './pages/Blog'
import Resume from './pages/Resume'
import About from './pages/About'
import Contact from './pages/Contact'
import SkillNetwork from './pages/Skills'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main style={{ flex: 1 }}>
        <Home />
        <Projects />
        <Gallery />
        <SkillNetwork />
        <Certificates />
        <Blog />
        <Resume />
        <About />
        <Contact />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} Rajat Jain — Built with React
      </footer>
    </div>
  )
}
