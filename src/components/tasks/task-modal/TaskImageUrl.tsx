import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import { isValidImageUrl } from '../../../utils/imageUrl';
import {
  imageSearchService,
  type ImageSearchResult,
} from '../../../services/imageSearch.service';

interface TaskImageUrlProps {
  value: string;
  onChange: (value: string) => void;
  /** Sugerencia de búsqueda (p. ej. título de la tarea). */
  suggestedQuery?: string;
}

export const TaskImageUrl = ({ value, onChange, suggestedQuery = '' }: TaskImageUrlProps) => {
  const trimmed = value.trim();
  const valid = isValidImageUrl(value);
  const showPreview = Boolean(trimmed) && valid;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [lightbox, setLightbox] = useState<ImageSearchResult | 'current' | null>(null);

  useEffect(() => {
    if (!query && suggestedQuery.trim()) {
      setQuery(suggestedQuery.trim());
    }
    // Solo al montar / cuando cambia la sugerencia inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedQuery]);

  const runSearch = async () => {
    const term = query.trim() || suggestedQuery.trim();
    if (!term || searching) return;

    setSearching(true);
    setSearchError(null);
    try {
      if (!query.trim() && suggestedQuery.trim()) {
        setQuery(suggestedQuery.trim());
      }
      const response = await imageSearchService.search(term);
      setResults(response.results);
      if (response.results.length === 0) {
        setSearchError('No hay resultados. Prueba otro término.');
      }
    } catch (e: unknown) {
      setResults([]);
      setSearchError(e instanceof Error ? e.message : 'Error al buscar');
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (item: ImageSearchResult) => {
    onChange(item.fullUrl);
    setLightbox(null);
    setResults([]);
    setSearchError(null);
  };

  const clearImage = () => {
    onChange('');
    setLightbox(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Imagen (opcional)
        </label>
        {showPreview && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
              onClick={() => setLightbox('current')}
            >
              <ArrowsPointingOutIcon className="w-3.5 h-3.5" aria-hidden />
              Ver grande
            </button>
            <button
              type="button"
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
              onClick={clearImage}
            >
              <TrashIcon className="w-3.5 h-3.5" aria-hidden />
              Quitar
            </button>
          </div>
        )}
      </div>

      {showPreview && (
        <button
          type="button"
          className="block w-full overflow-hidden rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-teal-500"
          onClick={() => setLightbox('current')}
          aria-label="Ver imagen en grande"
        >
          <img
            src={trimmed}
            alt="Vista previa de la imagen"
            className="h-28 w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </button>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void runSearch();
              }
            }}
            className="input-base !pl-9"
            placeholder={suggestedQuery.trim() || 'Buscar imagen…'}
            aria-label="Buscar imagen"
            autoComplete="off"
            disabled={searching}
          />
        </div>
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={() => void runSearch()}
          disabled={searching || !(query.trim() || suggestedQuery.trim())}
        >
          {searching ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {searchError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {searchError}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            Elige una imagen. Fotos de{' '}
            <a
              href="https://unsplash.com/?utm_source=task_manager_app&utm_medium=referral"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-teal-700 dark:hover:text-teal-400"
            >
              Unsplash
            </a>
            .
          </p>
          <ul
            className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-0.5"
            aria-label="Resultados de búsqueda de imágenes"
          >
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="group relative w-full overflow-hidden rounded-lg border border-[var(--border)] aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onClick={() => setLightbox(item)}
                  aria-label={`Ver ${item.alt}`}
                >
                  <img
                    src={item.thumbUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <button
          type="button"
          className="text-xs font-medium text-[var(--text-muted)] hover:text-teal-700 dark:hover:text-teal-400 hover:underline"
          onClick={() => setShowUrlInput((v) => !v)}
          aria-expanded={showUrlInput}
        >
          {showUrlInput ? 'Ocultar URL manual' : 'Pegar URL manualmente'}
        </button>
        {showUrlInput && (
          <div className="mt-2 space-y-1">
            <label htmlFor="background-url" className="sr-only">
              URL de imagen
            </label>
            <input
              type="url"
              id="background-url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="input-base"
              placeholder="https://ejemplo.com/imagen.jpg"
              inputMode="url"
              autoComplete="off"
              aria-invalid={trimmed ? !valid : undefined}
              aria-describedby="background-url-hint"
            />
            <p id="background-url-hint" className="text-xs text-[var(--text-muted)]">
              Enlace externo; no subimos archivos.
            </p>
            {trimmed && !valid && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                Usa una URL que empiece por http:// o https://
              </p>
            )}
          </div>
        )}
      </div>

      <ImageLightbox
        open={lightbox !== null}
        result={lightbox === 'current' ? null : lightbox}
        currentUrl={lightbox === 'current' ? trimmed : null}
        onClose={() => setLightbox(null)}
        onSelect={selectResult}
        onClear={lightbox === 'current' ? clearImage : undefined}
      />
    </div>
  );
};

type LightboxProps = {
  open: boolean;
  result: ImageSearchResult | null;
  currentUrl: string | null;
  onClose: () => void;
  onSelect: (item: ImageSearchResult) => void;
  onClear?: () => void;
};

function ImageLightbox({ open, result, currentUrl, onClose, onSelect, onClear }: LightboxProps) {
  const src = result?.fullUrl ?? currentUrl ?? '';
  const isPick = Boolean(result);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="modal-backdrop-transition-enter"
          enterFrom="modal-backdrop-transition-enter-from"
          enterTo="modal-backdrop-transition-enter-to"
          leave="modal-backdrop-transition-leave"
          leaveFrom="modal-backdrop-transition-leave-from"
          leaveTo="modal-backdrop-transition-leave-to"
        >
          <div className="modal-backdrop" />
        </Transition.Child>

        <div className="modal-container">
          <div className="modal-wrapper p-4">
            <Transition.Child
              as={Fragment}
              enter="modal-transition-enter"
              enterFrom="modal-transition-enter-from"
              enterTo="modal-transition-enter-to"
              leave="modal-transition-leave"
              leaveFrom="modal-transition-leave-from"
              leaveTo="modal-transition-leave-to"
            >
              <Dialog.Panel className="modal-panel max-w-2xl w-full">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Dialog.Title as="h3" className="modal-title text-base">
                    {isPick ? 'Vista previa' : 'Imagen de la tarea'}
                  </Dialog.Title>
                  <button type="button" onClick={onClose} className="modal-close-button" aria-label="Cerrar">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {src && (
                  <img
                    src={src}
                    alt={result?.alt ?? 'Imagen seleccionada'}
                    className="w-full max-h-[55vh] object-contain rounded-xl bg-black/5 dark:bg-white/5"
                    referrerPolicy="no-referrer"
                  />
                )}

                {result && (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    Foto de{' '}
                    <a
                      href={result.photographerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-teal-700 dark:hover:text-teal-400"
                    >
                      {result.photographer}
                    </a>{' '}
                    en Unsplash
                  </p>
                )}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button type="button" className="btn-secondary text-sm" onClick={onClose}>
                    Cerrar
                  </button>
                  {onClear && (
                    <button type="button" className="btn-secondary text-sm text-red-600" onClick={onClear}>
                      Quitar imagen
                    </button>
                  )}
                  {result && (
                    <button
                      type="button"
                      className="btn-primary text-sm"
                      onClick={() => onSelect(result)}
                    >
                      Usar esta imagen
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
