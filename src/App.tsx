import { useCallback, useState } from 'react'
import type { InfoZone, Project } from './data/profile'
import type { Lang } from './data/i18n'
import { Experience } from './components/Experience'
import { HUD } from './components/HUD'
import { Loader } from './components/Loader'
import './App.css'

const detectLang = (): Lang =>
  typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en'

function App() {
  const [lang, setLang] = useState<Lang>(detectLang)
  const [activeZone, setActiveZone] = useState<InfoZone | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const handleZoneEnter = useCallback((zone: InfoZone) => {
    setActiveZone(zone)
  }, [])

  const handleZoneExit = useCallback((zoneId: string) => {
    setActiveZone((current) => (current?.id === zoneId ? null : current))
  }, [])

  const handleProjectEnter = useCallback((project: Project) => {
    setActiveProject(project)
  }, [])

  const handleProjectExit = useCallback((projectId: string) => {
    setActiveProject((current) => (current?.id === projectId ? null : current))
  }, [])

  return (
    <div className="app">
      <Experience
        lang={lang}
        onZoneEnter={handleZoneEnter}
        onZoneExit={handleZoneExit}
        onProjectEnter={handleProjectEnter}
        onProjectExit={handleProjectExit}
      />
      <HUD
        lang={lang}
        onLangChange={setLang}
        activeZone={activeZone}
        activeProject={activeProject}
      />
      <Loader lang={lang} />
    </div>
  )
}

export default App
