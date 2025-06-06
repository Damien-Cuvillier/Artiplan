// Composant PDF Document
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer'
import { FileText, Download, Eye, Calendar, MapPin, Clock, User, Euro, CheckCircle } from 'lucide-react'

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3
  },
  column: {
    flexDirection: 'column',
    flex: 1
  },
  label: {
    fontWeight: 'bold',
    width: 100
  },
  value: {
    flex: 1
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb'
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 5
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    padding: 5
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  tableCell: {
    fontSize: 8
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 10
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 8,
    margin: 2,
    textAlign: 'center',
    borderRadius: 4
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 8,
    color: '#6b7280'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 5,
    marginBottom: 10
  },
  progressFill: {
    height: 8,
    backgroundColor: '#2563eb',
    borderRadius: 4
  },
  categorySection: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5
  },
  interventionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    padding: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
});

const ChantierPDFDocument = ({ chantier, interventions = [] }) => {
    // Calculs
    const totalInterventions = interventions.length
    const totalHeures = interventions.reduce((acc, int) => acc + (int.duree || 0), 0)
    const interventionsTerminees = interventions.filter(int => 
      int.statut === 'termine' || int.statut === 'terminee' || int.statut === 'terminée'
    ).length
    const budgetTotal = chantier.budget || 0
    const coutTotalInterventions = interventions.reduce((acc, int) => acc + (int.prix || 0), 0)
  
    const formatDate = (dateString) => {
      if (!dateString) return 'Date non définie';
      
      try {
        // Si la date est déjà formatée (cas des mises à jour en direct)
        if (typeof dateString === 'string' && dateString.includes('/')) {
          return dateString;
        }
        
        // Gérer à la fois date_intervention et date
        const dateValue = dateString.date_intervention || dateString;
        const date = new Date(dateValue);
        
        if (isNaN(date.getTime())) {
          console.warn('Date invalide:', dateString);
          return 'Date invalide';
        }
        
        // Formater la date en français
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        console.error('Erreur de formatage de date:', e, 'Valeur reçue:', dateString);
        return 'Date invalide';
      }
    }
  
    const getStatutLabel = (statut) => {
      const labels = {
        'en_attente': 'En attente',
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'annule': 'Annulé',
        'planifie': 'Planifié',
        'suspendu': 'Suspendu'
      }
      return labels[statut] || statut || 'Non défini';
    }
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* En-tête */}
          <View style={styles.header}>
            <Text style={styles.title}>RAPPORT DE CHANTIER</Text>
            <Text style={styles.subtitle}>Généré le {formatDate(new Date().toISOString())}</Text>
          </View>
  
          {/* Informations du chantier */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations du chantier</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Titre:</Text>
              <Text style={styles.value}>{chantier.titre || 'Non défini'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>{chantier.client_nom || 'Non défini'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>{chantier.adresse || 'Non définie'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{chantier.description || 'Aucune description'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Début:</Text>
              <Text style={styles.value}>{formatDate(chantier.date_debut)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fin prévue:</Text>
              <Text style={styles.value}>{formatDate(chantier.date_fin_prevue || chantier.date_fin)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Statut:</Text>
              <Text style={styles.value}>{getStatutLabel(chantier.statut)}</Text>
            </View>
          </View>
  
          {/* Résumé exécutif */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumé exécutif</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalInterventions}</Text>
                <Text style={styles.statLabel}>Interventions</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{interventionsTerminees}</Text>
                <Text style={styles.statLabel}>Terminées</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{totalHeures}h</Text>
                <Text style={styles.statLabel}>Temps total</Text>
              </View>
              <View style={styles.statBox}>
              <Text style={styles.statNumber}>{`${String(budgetTotal).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`}</Text>
                <Text style={styles.statLabel}>Budget total</Text>
              </View>
            </View>
          </View>
  
          {/* Détail des interventions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détail des interventions</Text>
            {interventions.map((int, index) => (
              <View key={index} style={[
                styles.interventionItem, 
                { 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  padding: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 4
                }
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>
                    {int.titre}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12, fontSize: 9, color: '#6b7280' }}>
                    <Text>{formatDate(int.date_intervention || int.date)}</Text>
                    <Text>{int.duree}h</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                  <Text style={{ 
                    fontSize: 9, 
                    fontWeight: 'medium',
                    minWidth: 70,
                    textAlign: 'right'
                  }}>
                    {getStatutLabel(int.statut)}
                  </Text>
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: 'bold',
                    minWidth: 60,
                    textAlign: 'right'
                  }}>
                    {int.prix ? `${int.prix.toLocaleString('fr-FR')}€` : '-'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
  
          {/* Tableau détaillé */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique détaillé</Text>
            <View style={styles.table}>
              {/* En-tête du tableau */}
              <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
                <View style={[styles.tableColHeader, { width: '20%' }]}>
                  <Text style={styles.tableCellHeader}>Date</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '40%' }]}>
                  <Text style={styles.tableCellHeader}>Description</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '10%', textAlign: 'center' }]}>
                  <Text style={styles.tableCellHeader}>Durée</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '15%', textAlign: 'center' }]}>
                  <Text style={styles.tableCellHeader}>Statut</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '15%', textAlign: 'center' }]}>
                  <Text style={styles.tableCellHeader}>Prix</Text>
                </View>
              </View>
              
              {/* Lignes du tableau */}
              {interventions.map((int, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={styles.tableCell}>{formatDate(int.date_intervention || int.date)}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '40%' }]}>
                    <Text style={styles.tableCell}>{int.titre}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '10%', alignItems: 'center' }]}>
                    <Text style={[styles.tableCell, { textAlign: 'center' }]}>{int.duree}h</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text style={[styles.tableCell, { textAlign: 'center' }]}>{getStatutLabel(int.statut)}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text style={[styles.tableCell, { textAlign: 'right', paddingRight: 8 }]}>
                      {int.prix ? `${int.prix}€` : '-'}
                    </Text>
                  </View>
                </View>
              ))}
              
              {/* Ligne du total des interventions */}
              <View style={[styles.tableRow, { borderTop: '1px solid #e5e7eb' }]}>
                <View style={[styles.tableCol, { width: '60%' }]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Total des interventions :</Text>
                </View>
                <View style={[styles.tableCol, { width: '10%', alignItems: 'center' }]}>
                  <Text style={[styles.tableCell, { textAlign: 'center', fontWeight: 'bold' }]}>{totalHeures}h</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={[styles.tableCell, { textAlign: 'center', fontWeight: 'bold' }]}>-</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', paddingRight: 8 }]}>
                  {`${String(coutTotalInterventions).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`}
                  </Text>
                </View>
              </View>
              
              {/* Ligne du budget total */}
              <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
                <View style={[styles.tableCol, { width: '85%' }]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Budget total du chantier :</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', paddingRight: 8 }]}>
                    {`${String(budgetTotal).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
  
          {/* Pied de page */}
          <View style={styles.footer}>
            <Text>Rapport généré automatiquement le {formatDate(new Date().toISOString())}</Text>
            <Text>Application de gestion de chantiers</Text>
          </View>
        </Page>
      </Document>
    )
  }

  export default ChantierPDFDocument