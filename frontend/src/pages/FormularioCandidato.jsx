import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { criarCandidato, parsePdf } from '../services/api.js'
import { candidatoSchema } from '../schemas/candidatoSchema.js'
import CampoFormulario from '../components/CampoFormulario.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Mapeia erros HTTP retornados pela API para mensagens legíveis.
 * @param {import('axios').AxiosError} err
 * @returns {string}
 */
function mensagemErroHttp(err) {
  const status = err?.response?.status
  const serverMsg = err?.response?.data?.message || err?.response?.data?.error

  if (serverMsg) return serverMsg
  if (status === 422) return 'Dados inválidos. Verifique os campos e tente novamente.'
  if (status === 400) return 'Requisição inválida. Verifique os dados informados.'
  if (status === 409) return 'Já existe um candidato com este e-mail.'
  if (status >= 500) return 'Erro interno no servidor. Tente novamente mais tarde.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export default function FormularioCandidato() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdicao = Boolean(id)

  // PDF upload state
  const fileInputRef = useRef(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfErro, setPdfErro] = useState(null)
  const [pdfCarregando, setPdfCarregando] = useState(false)
  const [camposPreenchidos, setCamposPreenchidos] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(candidatoSchema),
    defaultValues: {
      nomeCompleto: '',
      email: '',
      telefone: '',
      areaInteresse: '',
      resumoProfissional: '',
    },
  })

  // ─── Handlers PDF ────────────────────────────────────────────────────────────

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setPdfErro(null)
    setCamposPreenchidos(null)

    if (!file) {
      setPdfFile(null)
      return
    }

    if (file.type !== 'application/pdf') {
      setPdfErro('O arquivo deve ser um PDF.')
      setPdfFile(null)
      e.target.value = ''
      return
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setPdfErro('O arquivo PDF deve ter no máximo 5 MB.')
      setPdfFile(null)
      e.target.value = ''
      return
    }

    setPdfFile(file)
  }

  async function handleExtrairPdf() {
    if (!pdfFile) return

    setPdfErro(null)
    setCamposPreenchidos(null)
    setPdfCarregando(true)

    try {
      const dados = await parsePdf(pdfFile)

      const camposMap = {
        nomeCompleto: 'Nome completo',
        email: 'E-mail',
        telefone: 'Telefone',
        areaInteresse: 'Área de interesse',
        resumoProfissional: 'Resumo profissional',
      }

      const preenchidos = []
      Object.entries(camposMap).forEach(([campo, label]) => {
        const valor = dados[campo]
        if (valor) {
          setValue(campo, valor, { shouldValidate: true, shouldDirty: true })
          preenchidos.push(label)
        }
      })

      if (preenchidos.length > 0) {
        setCamposPreenchidos(preenchidos)
        toast.success(`PDF extraído com sucesso!`)
      } else {
        setPdfErro('Nenhum dado foi extraído do PDF. Preencha manualmente.')
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Não foi possível extrair dados do PDF. Preencha o formulário manualmente.'
      setPdfErro(msg)
    } finally {
      setPdfCarregando(false)
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  async function onSubmit(data) {
    try {
      await criarCandidato(data)
      toast.success('Candidato cadastrado com sucesso!')
      navigate('/candidatos')
    } catch (err) {
      const msg = mensagemErroHttp(err)
      toast.error(msg)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <section aria-labelledby="titulo-formulario" className="max-w-2xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/candidatos')}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Voltar para a listagem"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 id="titulo-formulario" className="text-2xl font-bold text-gray-800">
            {isEdicao ? 'Editar Candidato' : 'Novo Candidato'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdicao
              ? 'Atualize os dados do candidato abaixo.'
              : 'Preencha os dados do candidato abaixo.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* ── Seção Upload PDF ──────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar dados do currículo (opcional)
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Selecione um PDF para preencher automaticamente os campos abaixo. Arquivos de até 5 MB.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Input file customizado */}
            <label
              htmlFor="pdf-upload"
              className="flex-1 flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg px-4 py-3 cursor-pointer transition-colors bg-white"
            >
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm text-gray-600 truncate">
                {pdfFile ? pdfFile.name : 'Clique para selecionar um PDF'}
              </span>
              <input
                id="pdf-upload"
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Selecionar arquivo PDF"
              />
            </label>

            {/* Botão extrair */}
            <button
              type="button"
              onClick={handleExtrairPdf}
              disabled={!pdfFile || pdfCarregando}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            >
              {pdfCarregando ? (
                <>
                  <LoadingSpinner size="sm" />
                  Extraindo...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Extrair do PDF
                </>
              )}
            </button>
          </div>

          {/* Feedback PDF */}
          {pdfErro && (
            <div role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {pdfErro}
            </div>
          )}

          {camposPreenchidos && camposPreenchidos.length > 0 && (
            <div role="status" className="mt-3 flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                Campos preenchidos automaticamente:{' '}
                <strong>{camposPreenchidos.join(', ')}</strong>. Revise antes de salvar.
              </span>
            </div>
          )}
        </div>

        {/* ── Formulário ────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 py-6 flex flex-col gap-5"
        >
          <CampoFormulario
            label="Nome completo"
            name="nomeCompleto"
            register={register}
            error={errors.nomeCompleto}
            placeholder="Ex: Maria Silva"
            required
          />

          <CampoFormulario
            label="E-mail"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            placeholder="Ex: maria.silva@email.com"
            required
          />

          <CampoFormulario
            label="Telefone"
            name="telefone"
            type="tel"
            register={register}
            error={errors.telefone}
            placeholder="Ex: (11) 99999-9999"
          />

          <CampoFormulario
            label="Área ou cargo de interesse"
            name="areaInteresse"
            register={register}
            error={errors.areaInteresse}
            placeholder="Ex: Desenvolvedor Front-end"
          />

          <CampoFormulario
            label="Resumo profissional"
            name="resumoProfissional"
            register={register}
            error={errors.resumoProfissional}
            placeholder="Descreva sua experiência, habilidades e objetivos profissionais..."
            textarea
            rows={6}
          />

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/candidatos')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Candidato
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
