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
    const coutTotal = interventions.reduce((acc, int) => acc + (int.cout || 0), 0)
    const interventionsTerminees = interventions.filter(int => int.statut === 'terminee').length
    const progressionPourcentage = totalInterventions > 0 ? Math.round((interventionsTerminees / totalInterventions) * 100) : 0
  
    // Grouper par catégorie
    const interventionsParCategorie = interventions.reduce((acc, int) => {
      const cat = int.categorie || 'Autre'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(int)
      return acc
    }, {})
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR')
    }
  
    const getStatutLabel = (statut) => {
      const labels = {
        'en_attente': 'En attente',
        'en_cours': 'En cours',
        'terminee': 'Terminée',
        'annulee': 'Annulée'
      }
      return labels[statut] || statut
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
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>{chantier.nom}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>{chantier.client}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>{chantier.adresse}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{chantier.description}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Début:</Text>
              <Text style={styles.value}>{formatDate(chantier.dateDebut)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fin prévue:</Text>
              <Text style={styles.value}>{formatDate(chantier.dateFin)}</Text>
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
                <Text style={styles.statNumber}>{coutTotal}€</Text>
                <Text style={styles.statLabel}>Coût total</Text>
              </View>
            </View>
            
            <Text>Progression: {progressionPourcentage}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressionPourcentage}%` }]} />
            </View>
          </View>
  
          {/* Interventions par catégorie */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interventions par catégorie</Text>
            {Object.entries(interventionsParCategorie).map(([categorie, ints]) => (
              <View key={categorie} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{categorie} ({ints.length})</Text>
                {ints.map((int, index) => (
                  <View key={index} style={styles.interventionItem}>
                    <View style={styles.column}>
                      <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{int.titre}</Text>
                      <Text style={{ fontSize: 8, color: '#6b7280' }}>
                        {formatDate(int.date)} - {int.duree}h
                      </Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{int.cout}€</Text>
                      <Text style={{ fontSize: 8 }}>{getStatutLabel(int.statut)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
  
          {/* Tableau détaillé */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique détaillé</Text>
            <View style={styles.table}>
              {/* En-tête du tableau */}
              <View style={styles.tableRow}>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Date</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '35%' }]}>
                  <Text style={styles.tableCellHeader}>Intervention</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Durée</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Statut</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Coût</Text>
                </View>
              </View>
              
              {/* Lignes du tableau */}
              {interventions.map((int, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{formatDate(int.date)}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '35%' }]}>
                    <Text style={styles.tableCell}>{int.titre}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{int.duree}h</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{getStatutLabel(int.statut)}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{int.cout}€</Text>
                  </View>
                </View>
              ))}
              
              {/* Ligne totale */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCol, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL</Text>
                </View>
                <View style={[styles.tableCol, { width: '35%', backgroundColor: '#f3f4f6' }]}>
                  <Text style={styles.tableCell}></Text>
                </View>
                <View style={[styles.tableCol, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{totalHeures}h</Text>
                </View>
                <View style={[styles.tableCol, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={styles.tableCell}></Text>
                </View>
                <View style={[styles.tableCol, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{coutTotal}€</Text>
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