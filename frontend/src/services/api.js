import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Lista todos os candidatos cadastrados.
 * @returns {Promise<Array>} Lista de candidatos
 */
export async function listarCandidatos() {
  const response = await api.get('/candidatos')
  return response.data
}

/**
 * Busca um candidato pelo ID.
 * @param {string|number} id - ID do candidato
 * @returns {Promise<Object>} Dados do candidato
 */
export async function buscarCandidato(id) {
  const response = await api.get(`/candidatos/${id}`)
  return response.data
}

/**
 * Cria um novo candidato.
 * @param {Object} data - Dados do candidato
 * @returns {Promise<Object>} Candidato criado
 */
export async function criarCandidato(data) {
  const response = await api.post('/candidatos', data)
  return response.data
}

/**
 * Faz upload de um PDF e extrai informações do currículo.
 * @param {File} file - Arquivo PDF
 * @returns {Promise<Object>} Dados extraídos do PDF
 */
export async function parsePdf(file) {
  const formData = new FormData()
  formData.append('pdf', file)

  const response = await api.post('/candidatos/parse-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export default api
