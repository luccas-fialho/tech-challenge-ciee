/**
 * Spinner de carregamento acessível.
 *
 * @param {Object} props
 * @param {string} [props.size='md'] - Tamanho: 'sm' | 'md' | 'lg'
 * @param {string} [props.label='Carregando...'] - Texto acessível
 * @param {string} [props.className] - Classes adicionais
 */
export default function LoadingSpinner({ size = 'md', label = 'Carregando...', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div role="status" className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.md}
          border-blue-200 border-t-blue-600
          rounded-full animate-spin
        `}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
