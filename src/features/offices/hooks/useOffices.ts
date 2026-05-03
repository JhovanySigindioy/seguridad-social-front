import { useState, useEffect } from 'react';
import api from '../../../services/api/axios-instance';

export const useOffices = () => {
  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await api.get('/offices');
        setOffices(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar sedes');
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);

  return { offices, loading, error };
};
