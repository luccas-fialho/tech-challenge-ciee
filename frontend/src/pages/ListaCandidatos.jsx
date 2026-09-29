import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarCandidatos } from '../services/api.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import MensagemVazia from '../components/MensagemVazia.jsx'

/**
 * Formata uma data ISO em formato brasileiro legível.
 * @param {string} dataISO
 * @returns {string}
 */
function formatarData(dataISO) {
  if (!dataISO) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dataISO))
  } catch {
    return dataISO
  }
}

export default function ListaCandidatos() {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        setCarregando(true)
        setErro(null)
        const dados = await listarCandidatos()
        if (!cancelado) {
          setCandidatos(Array.isArray(dados) ? dados : dados?.data ?? [])
        }
      } catch (err) {
        if (!cancelado) {
          setErro(
            err?.response?.data?.message ||
            'Não foi possível carregar os candidatos. Tente novamente.'
          )
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
  }, [])

  return (
    <section aria-labelledby="titulo-lista">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 id="titulo-lista" className="text-2xl font-bold text-gray-800">
            Candidatos Cadastrados
          </h2>
          {!carregando && !erro && (
            <p className="text-sm text-gray-500 mt-1">
              {candidatos.length === 0
                ? 'Nenhum candidato encontrado'
                : `${candidatos.length} candidato${candidatos.length !== 1 ? 's' : ''} encontrado${candidatos.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/candidatos/novo')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Candidato
        </button>
      </div>

      {/* Estado de carregamento */}
      {carregando && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16">
          <LoadingSpinner size="lg" label="Carregando candidatos..." />
          <p className="text-center text-gray-500 text-sm mt-4">Carregando candidatos...</p>
        </div>
      )}

      {/* Estado de erro */}
      {!carregando && erro && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="rounded-full bg-red-100 p-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Erro ao carregar</h3>
              <p className="text-sm text-red-600">{erro}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Lista vazia */}
      {!carregando && !erro && candidatos.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <MensagemVazia
            titulo="Nenhum candidato cadastrado"
            descricao="Comece cadastrando o primeiro candidato clicando no botão acima."
            acao={
              <button
                onClick={() => navigate('/candidatos/novo')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Cadastrar candidato
              </button>
            }
          />
        </div>
      )}

      {/* Tabela de candidatos */}
      {!carregando && !erro && candidatos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Nome', 'E-mail', 'Área de Interesse', 'Data de Cadastro', 'Ações'].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {candidatos.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/50 transition-colors duration-100"
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900 text-sm">{c.nomeCompleto || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{c.email || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      {c.areaInteresse ? (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full max-w-[200px] truncate">
                          {c.areaInteresse}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatarData(c.createdAt || c.dataCadastro)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/candidatos/${c.id}`)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-150 focus:outline-none focus:underline"
                        aria-label={`Ver detalhes de ${c.nomeCompleto}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
