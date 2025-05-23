import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Calendar, 
  User, 
  Euro, 
  BarChart3, 
  Plus,
  Edit,
  FileText,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Trash2
} from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'
import { statusLabels, priorityLabels, typeLabels } from '../data/chantiers'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import ChantierPDF from '../components/ChantierPDF'
import InterventionForm from '../components/forms/InterventionForm'

const ChantierDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    currentChantier, 
    fetchChantierById, 
    isLoading, 
    getInterventionsByChantier,
    updateChantier,
    deleteChantier
  } = useChantierStore()
  
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [showAddIntervention, setShowAddIntervention] = useState(false)
  const [editingIntervention, setEditingIntervention] = useState(null)
  const [pdfDataUrl, setPdfDataUrl] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    address: '',
    startDate: '',
    endDate: '',
    budget: '',
    client: '',
    description: '',
    status: '',
    priority: ''
  })

  // Récupérer les interventions
  const interventions = getInterventionsByChantier(id)

  useEffect(() => {
    if (id) {
      fetchChantierById(id)
      setPdfDataUrl(null)
    }
  }, [id, fetchChantierById])

  useEffect(() => {
    if (currentChantier) {
      setEditData({
        name: currentChantier.name || '',
        address: currentChantier.address || '',
        startDate: currentChantier.startDate || '',
        endDate: currentChantier.endDate || '',
        budget: currentChantier.budget || '',
        client: currentChantier.client || '',
        description: currentChantier.description || '',
        status: currentChantier.status || '',
        priority: currentChantier.priority || 'medium'
      })
    }
  }, [currentChantier])

  const getStatusColor = (status) => {
    const colors = {
      planifie: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      termine: 'bg-green-100 text-green-800',
      suspendu: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    await updateChantier(parseInt(id), {
      ...editData,
      budget: parseFloat(editData.budget) || 0
    })
    setShowEditModal(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isLoading || !currentChantier) {
    return !currentChantier && !isLoading ? (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Chantier introuvable</h2>
        <p className="mt-2 text-gray-600">Le chantier demandé n'existe pas.</p>
        <Link 
          to="/dashboard" 
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retour au dashboard
        </Link>
      </div>
    ) : (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderPDFButtons = () => (
    <div className="mt-6 space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
      {/* Bouton pour générer et prévisualiser le PDF */}
      <button
        onClick={() => setShowPdfPreview(true)}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FileText className="w-5 h-5 mr-2" />
        Générer PDF
      </button>
  
      {/* Bouton pour télécharger le PDF */}
      <PDFDownloadLink
        document={<ChantierPDF chantier={currentChantier} interventions={interventions} />}
        fileName={`chantier-${currentChantier.id}-${new Date().toISOString().split('T')[0]}.pdf`}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        {({ loading }) => (
          <>
            <ImageIcon className="w-5 h-5 mr-2" />
            {loading ? 'Préparation...' : 'Télécharger PDF'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  )
  
  const renderPDFPreview = () => (
    <div className={`fixed inset-0 z-50 ${showPdfPreview ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100vh-200px)]">
              <PDFViewer width="100%" height="100%">
                <ChantierPDF chantier={currentChantier} interventions={interventions} />
              </PDFViewer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Toast de succès */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          Chantier supprimé avec succès
        </div>
      )}

      {/* Header avec actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentChantier.name}</h1>
          <p className="mt-2 text-gray-600">{currentChantier.description}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/intervention/new/${currentChantier.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle intervention
          </Link>
          <button 
            onClick={() => setShowEditModal(true)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-red-300 text-red-700 px-4 py-2 rounded-md hover:bg-red-50 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      {renderPDFButtons()}

      {/* Modal de prévisualisation PDF */}
      {renderPDFPreview()}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
              <p className="mt-2 text-gray-600">
                Êtes-vous sûr de vouloir supprimer le chantier "{currentChantier.name}" ?
                Cette action est irréversible.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true)
                  await deleteChantier(currentChantier.id)
                  setShowDeleteConfirm(false)
                  setShowToast(true)
                  // Attendre que l'animation de disparition soit terminée
                  setTimeout(() => {
                    navigate('/chantiers')
                  }, 1000)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Modifier le chantier</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom du chantier
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <input
                    type="text"
                    name="client"
                    value={editData.client}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date de début
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={editData.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={editData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Budget (€)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={editData.budget}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={editData.priority}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="low">Normale</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={editData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Infos principales */}
      <div className={`transition-opacity duration-500 ${isDeleting ? 'opacity-0' : 'opacity-100'}`}>
        {/* Card principale */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">{currentChantier.address}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Client</p>
                  <p className="text-sm text-gray-600">{currentChantier.client}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dates</p>
                  <p className="text-sm text-gray-600">
                    Du {new Date(currentChantier.startDate).toLocaleDateString()} 
                    au {new Date(currentChantier.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Euro className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Budget</p>
                  <p className="text-sm text-gray-600">{currentChantier.budget.toLocaleString()} €</p>
                </div>
              </div>

              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Progression</p>
                  <div className="flex items-center mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${currentChantier.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{currentChantier.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentChantier.status)}`}>
                  {statusLabels[currentChantier.status]}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(currentChantier.priority)}`}>
                  {priorityLabels[currentChantier.priority]}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {typeLabels[currentChantier.type]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Photos ({currentChantier.images.length})
          </h3>
          {currentChantier.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {currentChantier.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Photo ${i + 1}`}
                  className="rounded-md object-cover w-full h-40"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune photo disponible</p>
          )}
        </div>
      </div>

      {/* Section des interventions */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Interventions ({interventions.length})
            </h2>
            <button
              onClick={() => setShowAddIntervention(!showAddIntervention)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle intervention
            </button>
          </div>

          {/* Formulaire d'ajout/modification d'intervention */}
          {(showAddIntervention || editingIntervention) && (
            <div className="mt-4">
              <InterventionForm 
                chantierId={id}
                intervention={editingIntervention}
                onSuccess={() => {
                  setShowAddIntervention(false)
                  setEditingIntervention(null)
                }}
                onCancel={() => {
                  setShowAddIntervention(false)
                  setEditingIntervention(null)
                }}
              />
            </div>
          )}

          {/* Liste des interventions */}
          <div className="mt-4 space-y-4">
            {interventions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune intervention enregistrée
              </p>
            ) : (
              interventions.map((intervention) => (
                <div 
                  key={intervention.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {intervention.type.charAt(0).toUpperCase() + intervention.type.slice(1)}
                      </h3>
                      <p className="mt-1 text-gray-600">{intervention.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(intervention.date).toLocaleDateString()}
                        </span>
                        {intervention.duration && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {intervention.duration}h
                          </span>
                        )}
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs
                          ${intervention.status === 'terminee' ? 'bg-green-100 text-green-800' :
                            intervention.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                            intervention.status === 'planifiee' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}
                        >
                          {intervention.status === 'terminee' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {intervention.status === 'en_cours' && <Clock className="h-3 w-3 mr-1" />}
                          {intervention.status === 'planifiee' && <Calendar className="h-3 w-3 mr-1" />}
                          {intervention.status === 'annulee' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {intervention.status.charAt(0).toUpperCase() + intervention.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingIntervention(intervention)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChantierDetail
