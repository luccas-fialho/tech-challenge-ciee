import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buscarCandidato } from "../services/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

/**
 * Formata uma data ISO em formato brasileiro.
 * @param {string} dataISO
 * @returns {string}
 */
function formatarData(dataISO) {
  if (!dataISO) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dataISO));
  } catch {
    return dataISO;
  }
}

/**
 * Exibe um campo de detalhe com label e valor.
 */
function CampoDetalhe({ label, valor, grande = false }) {
  return (
    <div className={grande ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </dt>
      <dd
        className={`text-sm text-gray-800 ${grande ? "whitespace-pre-wrap leading-relaxed" : ""}`}
      >
        {valor || <span className="text-gray-400 italic">Não informado</span>}
      </dd>
    </div>
  );
}

export default function DetalhesCandidato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        setCarregando(true);
        setErro(null);
        const dados = await buscarCandidato(id);
        if (!cancelado) setCandidato(dados);
      } catch (err) {
        if (!cancelado) {
          const status = err?.response?.status;
          if (status === 404) {
            setErro("Candidato não encontrado.");
          } else {
            setErro(
              err?.response?.data?.message ||
                "Não foi possível carregar os dados do candidato.",
            );
          }
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  return (
    <section aria-labelledby="titulo-detalhes" className="max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/candidatos")}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Voltar para a listagem"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 id="titulo-detalhes" className="text-2xl font-bold text-gray-800">
          Detalhes do Candidato
        </h2>
      </div>

      {/* Estado de carregamento */}
      {carregando && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16">
          <LoadingSpinner size="lg" />
          <p className="text-center text-gray-500 text-sm mt-4">
            Carregando dados...
          </p>
        </div>
      )}

      {/* Estado de erro */}
      {!carregando && erro && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="rounded-full bg-red-100 p-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Erro ao carregar
              </h3>
              <p className="text-sm text-red-600">{erro}</p>
            </div>
            <button
              onClick={() => navigate("/candidatos")}
              className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
            >
              Voltar para a listagem
            </button>
          </div>
        </div>
      )}

      {/* Dados do candidato */}
      {!carregando && !erro && candidato && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Banner com avatar inicial */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span
                className="text-white text-2xl font-bold"
                aria-hidden="true"
              >
                {(candidato.nomeCompleto || "?").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {candidato.nomeCompleto || "—"}
              </h3>
              {candidato.areaInteresse && (
                <p className="text-blue-100 text-sm mt-0.5">
                  {candidato.areaInteresse}
                </p>
              )}
            </div>
          </div>

          {/* Grid de campos */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 p-6">
            <CampoDetalhe label="E-mail" valor={candidato.email} />
            <CampoDetalhe label="Telefone" valor={candidato.telefone} />
            <CampoDetalhe
              label="Área de Interesse"
              valor={candidato.areaInteresse}
            />
            <CampoDetalhe
              label="Data de Cadastro"
              valor={formatarData(
                candidato.createdAt || candidato.dataCadastro,
              )}
            />
            <CampoDetalhe
              label="Resumo Profissional"
              valor={candidato.resumoProfissional}
              grande
            />
          </dl>

          {/* Rodapé */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <span className="text-xs text-gray-400">
              ID:{" "}
              <code className="font-mono bg-gray-100 px-1 rounded">
                {candidato.id}
              </code>
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/candidatos")}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
