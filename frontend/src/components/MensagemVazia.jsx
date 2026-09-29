/**
 * Mensagem amigável para estado de lista vazia.
 *
 * @param {Object} props
 * @param {string} [props.titulo='Nenhum registro encontrado'] - Título da mensagem
 * @param {string} [props.descricao] - Texto descritivo
 * @param {React.ReactNode} [props.acao] - Elemento de ação (ex: botão)
 */
export default function MensagemVazia({
  titulo = 'Nenhum registro encontrado',
  descricao = 'Ainda não há itens cadastrados.',
  acao,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-5 mb-4">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{titulo}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{descricao}</p>
      {acao && <div>{acao}</div>}
    </div>
  )
}
