// src/components/PDFExport.jsx
import { memo, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import ChantierPDFDocument from './ChantierPDFDocuments';
import PDFViewerModal from './PDFViewerModal';

const PDFExport = memo(({ chantier, interventions }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!chantier || !interventions) return;
    
    try {
      setIsGenerating(true);
      const blob = await pdf(
        <ChantierPDFDocument chantier={chantier} interventions={interventions} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chantier-${chantier._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!chantier || !interventions) return null;

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Bouton Télécharger */}
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
            isGenerating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          <Download className="h-4 w-4 mr-1" />
          {isGenerating ? 'Génération...' : 'Télécharger PDF'}
        </button>

        {/* Bouton Aperçu */}
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Eye className="h-4 w-4 mr-1" />
          Aperçu PDF
        </button>
      </div>

      {/* Modal d'aperçu PDF */}
      <PDFViewerModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)}
      >
        <ChantierPDFDocument 
          chantier={chantier} 
          interventions={interventions} 
        />
      </PDFViewerModal>
    </>
  );
});

PDFExport.displayName = 'PDFExport';
export default PDFExport;