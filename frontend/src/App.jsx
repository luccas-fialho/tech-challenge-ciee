import { Routes, Route, Navigate } from 'react-router-dom'
import ListaCandidatos from './pages/ListaCandidatos.jsx'
import FormularioCandidato from './pages/FormularioCandidato.jsx'
import DetalhesCandidato from './pages/DetalhesCandidato.jsx'

function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <svg
          className="w-7 h-7 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h1 className="text-xl font-bold tracking-tight">Cadastro de Currículos</h1>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/candidatos" replace />} />
          <Route path="/candidatos" element={<ListaCandidatos />} />
          <Route path="/candidatos/novo" element={<FormularioCandidato />} />
          <Route path="/candidatos/:id" element={<DetalhesCandidato />} />
          <Route path="/candidatos/:id/editar" element={<FormularioCandidato />} />
          <Route path="*" element={<Navigate to="/candidatos" replace />} />
        </Routes>
      </main>
    </div>
  )
}
