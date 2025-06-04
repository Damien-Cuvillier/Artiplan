
import { PDFViewer } from '@react-pdf/renderer';
import { FileText, Download, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import ChantierPDFDocument from './ChantierPDFDocuments';


// Composant principal
const PDFPreview = ({ chantier, interventions }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // S'assurer que le composant est monté côté client
    setIsClient(true);
  }, []);

  if (!chantier || !interventions) {
    console.error('Données manquantes pour le PDF');
    return null;
  }

  const fileName = `rapport-chantier-${chantier.nom.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

  // Fonction pour gérer le téléchargement
  const handleDownload = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <ChantierPDFDocument chantier={chantier} interventions={interventions} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  // Ne rien afficher côté serveur
  if (!isClient) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapport de chantier
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {isPreviewOpen ? 'Masquer' : 'Aperçu'}
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      {/* Aperçu PDF */}
      {isPreviewOpen && (
        <div className="p-6">
          <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <PDFViewer width="100%" height="100%">
              <ChantierPDFDocument chantier={chantier} interventions={interventions} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}

// Exporte les deux composants
export { PDFPreview as default };