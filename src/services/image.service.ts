import axios from 'axios';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

const CATEGORIES = ['productivity', 'workspace', 'minimal', 'nature', 'pattern'];

export const imageService = {
  /**
   * Obtiene una imagen aleatoria de Unsplash basada en una categoría
   * @param category - Categoría de la imagen (opcional)
   * @returns URL de la imagen
   */
  async getRandomImage(category?: string): Promise<string> {
    try {
      const query = category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const response = await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
        params: {
          query,
          orientation: 'landscape',
          count: 1,
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      // Retornamos la URL de la imagen en tamaño pequeño para optimizar rendimiento
      return response.data[0].urls.small;
    } catch (error) {
      console.error('Error al obtener imagen de Unsplash:', error);
      // Retornamos una imagen de fallback
      return 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80';
    }
  },

  /**
   * Obtiene una imagen aleatoria para una tarea basada en su estado
   * @param status - Estado de la tarea
   * @returns URL de la imagen
   */
  async getTaskBackground(status: string): Promise<string> {
    const statusToCategory: Record<string, string> = {
      todo: 'minimal',
      in_progress: 'workspace',
      in_review: 'gradient',
      done: 'nature',
    };

    return this.getRandomImage(statusToCategory[status] || 'abstract');
  },
};
