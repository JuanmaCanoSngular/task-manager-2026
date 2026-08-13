// Edge Function: search-images
// Busca fotos en Unsplash (API key solo en servidor).
//
// POST { query: string, page?: number }
// → { results: ImageResult[], total: number, provider: 'unsplash' }
//
// Secrets: UNSPLASH_ACCESS_KEY
// Docs: https://unsplash.com/documentation#search-photos

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PER_PAGE = 12;

type UnsplashPhoto = {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: { thumb: string; small: string; regular: string; full: string };
  user: { name: string; links?: { html?: string } };
  links?: { html?: string; download_location?: string };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return json({ error: 'Método no permitido' }, 405);
    }

    const accessKey = Deno.env.get('UNSPLASH_ACCESS_KEY')?.trim();
    if (!accessKey) {
      return json(
        { error: 'Buscador de imágenes no configurado (falta UNSPLASH_ACCESS_KEY)' },
        503
      );
    }

    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (!query) {
      return json({ error: 'Escribe un término de búsqueda' }, 400);
    }
    if (query.length > 120) {
      return json({ error: 'La búsqueda es demasiado larga' }, 400);
    }

    const page = Math.max(1, Math.min(20, Number(body.page) || 1));

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(PER_PAGE));
    url.searchParams.set('orientation', 'landscape');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('unsplash error', response.status, detail);
      return json(
        { error: response.status === 403 ? 'Cuota o clave de Unsplash inválida' : 'Error al buscar imágenes' },
        response.status === 403 || response.status === 401 ? 502 : 502
      );
    }

    const data = (await response.json()) as {
      total?: number;
      results?: UnsplashPhoto[];
    };

    const results = (data.results ?? []).map((photo) => ({
      id: photo.id,
      thumbUrl: photo.urls.small || photo.urls.thumb,
      fullUrl: photo.urls.regular || photo.urls.full,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user?.name ?? 'Unsplash',
      photographerUrl: photo.user?.links?.html
        ? `${photo.user.links.html}?utm_source=task_manager_app&utm_medium=referral`
        : 'https://unsplash.com/?utm_source=task_manager_app&utm_medium=referral',
      pageUrl: photo.links?.html
        ? `${photo.links.html}?utm_source=task_manager_app&utm_medium=referral`
        : undefined,
      downloadLocation: photo.links?.download_location,
    }));

    return json({
      provider: 'unsplash',
      total: data.total ?? results.length,
      page,
      results,
    });
  } catch (error) {
    console.error('search-images:', error);
    return json({ error: error instanceof Error ? error.message : 'Error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
