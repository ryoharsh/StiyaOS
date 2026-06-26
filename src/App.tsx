import { useLocation } from 'react-router-dom'
import Router from './router'

function App() {
  const location = useLocation();

  return (<Router key={location.pathname} />)
}

export default App
