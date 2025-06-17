import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { memo, useState, useEffect } from 'react';
import ChantierPDFDocument from './ChantierPDFDocuments';

const PDFDownloadButton = memo(({ chantier, interventions }) => {
    const [isClient, setIsClient] = useState(false);
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    if (!isClient || !chantier || !interventions) return null;
  
    const handleDownload = async () => {
      try {
        const { pdf } = await import('@react-pdf/renderer');
        const blob = await pdf(<ChantierPDFDocument chantier={chantier} interventions={interventions} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chantier-${chantier._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    };
  
    return (
      <button
        onClick={handleDownload}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <Download className="-ml-1 mr-1 h-4 w-4" />
        Télécharger PDF
      </button>
    );
  });

PDFDownloadButton.displayName = 'PDFDownloadButton';
export default PDFDownloadButton;