import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#2563eb', // Bleu professionnel
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    fontSize: 10,
    color: '#6b7280', // Gris
    textAlign: 'right',
  },
  title: {
    fontSize: 28,
    color: '#1e3a8a', // Bleu foncé
    marginBottom: 5,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  section: {
    margin: '15 0',
    padding: 15,
    backgroundColor: '#f8fafc', // Gris très clair
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    width: 120,
    color: '#4b5563', // Gris foncé
    fontSize: 11,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    color: '#111827', // Presque noir
    fontSize: 11,
  },
  interventionCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  image: {
    marginVertical: 10,
    width: 200,
    height: 150,
    objectFit: 'cover',
    borderRadius: 4,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  statusBadge: {
    padding: '3 8',
    borderRadius: 12,
    fontSize: 10,
    color: '#ffffff',
    backgroundColor: '#2563eb',
  }
});

const ChantierPDF = ({ chantier, interventions }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête amélioré */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Rapport de Chantier</Text>
          <Text style={styles.subtitle}>{chantier.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text>Généré le {new Date().toLocaleDateString()}</Text>
          <Text style={{ marginTop: 5 }}>Réf: CH-{chantier.id}</Text>
        </View>
      </View>

      {/* Informations principales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Générales</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Client</Text>
          <Text style={styles.value}>{chantier.client}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Adresse</Text>
          <Text style={styles.value}>{chantier.address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date de début</Text>
          <Text style={styles.value}>{new Date(chantier.startDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Budget</Text>
          <Text style={styles.value}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(chantier.budget)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Statut</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(chantier.status) }]}>
            <Text>{chantier.status}</Text>
          </View>
        </View>
      </View>

      {/* Photos du chantier */}
      {chantier.images && chantier.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos du Chantier</Text>
          <View style={styles.imagesGrid}>
            {chantier.images.map((image, index) => (
              <Image
                key={index}
                style={styles.image}
                src={image}
              />
            ))}
          </View>
        </View>
      )}

      {/* Interventions */}
      {interventions && interventions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interventions ({interventions.length})</Text>
          {interventions.map((intervention, index) => (
            <View key={index} style={styles.interventionCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{new Date(intervention.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <Text style={styles.value}>{intervention.type}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{intervention.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pied de page */}
      <Text style={styles.footer}>
        Document généré automatiquement par Artiplan • Page 1/1
      </Text>
    </Page>
  </Document>
);

// Fonction utilitaire pour obtenir la couleur du statut
const getStatusColor = (status) => {
  const colors = {
    'en_cours': '#2563eb', // Bleu
    'termine': '#059669', // Vert
    'planifie': '#d97706', // Orange
    'suspendu': '#dc2626', // Rouge
  };
  return colors[status] || '#6b7280'; // Gris par défaut
};

export default ChantierPDF;