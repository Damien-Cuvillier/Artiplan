// Dans votre composant de formulaire d'édition
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from '../config/api';

function EditIntervention() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_intervention: '',
    // autres champs
  });

  // Charger les données de l'intervention
  useEffect(() => {
    const fetchIntervention = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}/${id}`, {
          headers: getAuthHeader()
        });
        const data = await response.json();
        setFormData(data.data.intervention);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchIntervention();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      navigate(`/chantiers/${formData.chantier_id}`); // Rediriger vers la page du chantier
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire ici */}
      <input
        type="text"
        name="titre"
        value={formData.titre}
        onChange={handleChange}
      />
    </form>
  );
}

export default EditIntervention;