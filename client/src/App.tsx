import './App.css'
import { Route, Routes } from 'react-router-dom'
import Induction from './training/Induction'

function App() {

  return (
    <>
     <Routes>
        <Route path="/training" element={<Induction />}/>
     </Routes>
    </>
  )
}

export default App
