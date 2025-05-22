export const mockChantiers = [
  {
    id: 1,
    name: "Rénovation Villa Dubois",
    address: "15 Rue des Lilas, 75010 Paris",
    client: "M. Dubois",
    status: "en_cours",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    description: "Rénovation complète d'une villa des années 80",
    budget: 45000,
    progress: 65,
    priority: "high",
    type: "renovation",
    images: [
      "/api/placeholder/400/300",
      "/api/placeholder/400/300"
    ]
  },
  {
    id: 2,
    name: "Construction Maison Martin",
    address: "8 Avenue du Parc, 69003 Lyon",
    client: "Famille Martin",
    status: "planifie",
    startDate: "2024-03-01",
    endDate: "2024-12-15",
    description: "Construction d'une maison individuelle moderne",
    budget: 180000,
    progress: 15,
    priority: "medium",
    type: "construction",
    images: [
      "/api/placeholder/400/300"
    ]
  },
  {
    id: 3,
    name: "Réparation Toiture Durand",
    address: "42 Rue de la Paix, 13001 Marseille",
    client: "Mme Durand",
    status: "termine",
    startDate: "2024-01-10",
    endDate: "2024-02-05",
    description: "Réparation et étanchéité de toiture",
    budget: 8500,
    progress: 100,
    priority: "urgent",
    type: "reparation",
    images: [
      "/api/placeholder/400/300",
      "/api/placeholder/400/300",
      "/api/placeholder/400/300"
    ]
  },
  {
    id: 4,
    name: "Aménagement Bureau Tech",
    address: "123 Boulevard de la Tech, 31000 Toulouse",
    client: "TechCorp",
    status: "en_cours",
    startDate: "2024-02-01",
    endDate: "2024-05-30",
    description: "Aménagement d'espaces de bureaux modernes",
    budget: 75000,
    progress: 40,
    priority: "medium",
    type: "amenagement",
    images: []
  }
]

export const statusLabels = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  suspendu: "Suspendu"
}

export const priorityLabels = {
  low: "Faible",
  medium: "Moyenne", 
  high: "Élevée",
  urgent: "Urgente"
}

export const typeLabels = {
  construction: "Construction",
  renovation: "Rénovation", 
  reparation: "Réparation",
  amenagement: "Aménagement"
}