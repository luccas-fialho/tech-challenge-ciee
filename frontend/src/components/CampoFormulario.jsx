/**
 * Componente de campo de formulário reutilizável.
 *
 * @param {Object} props
 * @param {string} props.label - Texto do label
 * @param {string} props.name - Nome do campo (para htmlFor)
 * @param {Function} props.register - Função register do React Hook Form
 * @param {Object} [props.error] - Objeto de erro do React Hook Form
 * @param {string} [props.type='text'] - Tipo do input
 * @param {string} [props.placeholder] - Placeholder do input
 * @param {boolean} [props.required=false] - Se o campo é obrigatório
 * @param {boolean} [props.textarea=false] - Se deve renderizar um textarea
 * @param {number} [props.rows=4] - Número de linhas do textarea
 */
export default function CampoFormulario({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  required = false,
  textarea = false,
  rows = 4,
}) {
  const baseInputClass = `
    block w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400
    shadow-sm transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
      : 'border-gray-300 bg-white hover:border-gray-400'
    }
  `

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
      </label>

      {textarea ? (
        <textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          className={baseInputClass + ' resize-y'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...register(name)}
        />
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          className={baseInputClass}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...register(name)}
        />
      )}

      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs text-red-600 flex items-center gap-1 mt-0.5"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  )
}
