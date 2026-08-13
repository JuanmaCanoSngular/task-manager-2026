import { supabase } from './supabase';

export type ImageSearchResult = {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  pageUrl?: string;
  downloadLocation?: string;
};

export type ImageSearchResponse = {
  provider: 'unsplash';
  total: number;
  page: number;
  results: ImageSearchResult[];
};

export const imageSearchService = {
  async search(query: string, page = 1): Promise<ImageSearchResponse> {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error('Escribe un término de búsqueda');
    }

    const { data, error } = await supabase.functions.invoke('search-images', {
      body: { query: trimmed, page },
    });

    if (error) {
      throw new Error(error.message || 'No se pudo contactar con el buscador de imágenes');
    }
    if (data?.error) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Error al buscar');
    }

    return data as ImageSearchResponse;
  },
};
