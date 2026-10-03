import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { BIOME_IDS } from '../domain/biome'
import { SPECIES_CATALOG, speciesName } from '../domain/species'
import { BottomSheet } from './BottomSheet'

// TODO: register src/catalog/gbif-derived-dataset.csv at https://www.gbif.org/derived-dataset/register
// and put the DOI it returns here (e.g. '10.15468/dd.xxxxxx').
export const GBIF_DERIVED_DATASET_DOI: string | null = null

const linkClass = 'text-emerald-300 underline underline-offset-2'

interface CreditsSheetProps {
  onClose: () => void
}

/** Data sources and the photographer of every bundled species photo, grouped by Biome. */
export function CreditsSheet({ onClose }: CreditsSheetProps) {
  const { t, i18n } = useTranslation()
  const titleId = useId()

  return (
    <BottomSheet onClose={onClose} labelledBy={titleId}>
      {(close) => (
        <>
          <h2 id={titleId} className="mb-3 text-center text-lg font-semibold text-emerald-50">
            {t('settings.credits.title')}
          </h2>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain text-xs text-emerald-200">
            <section className="space-y-1.5">
              <p>
                {t('settings.credits.speciesData')}{' '}
                <a href="https://www.inaturalist.org" target="_blank" rel="noreferrer" className={linkClass}>
                  iNaturalist
                </a>
                {' · '}
                <a href="https://www.gbif.org" target="_blank" rel="noreferrer" className={linkClass}>
                  GBIF.org
                </a>
              </p>
              <p>
                {GBIF_DERIVED_DATASET_DOI ? (
                  <>
                    {t('settings.credits.gbifCitation')}{' '}
                    <a
                      href={`https://doi.org/${GBIF_DERIVED_DATASET_DOI}`}
                      target="_blank"
                      rel="noreferrer"
                      className={linkClass}
                    >
                      https://doi.org/{GBIF_DERIVED_DATASET_DOI}
                    </a>
                  </>
                ) : (
                  `${t('settings.credits.gbifCitation')} ${t('settings.credits.doiPending')}`
                )}
              </p>
              <p>{t('settings.credits.biomeMap')}</p>
            </section>

            {BIOME_IDS.map((biome) => {
              const species = SPECIES_CATALOG.filter((s) => s.biome[0] === biome)
              if (species.length === 0) return null
              return (
                <section key={biome}>
                  <h3 className="mb-1 font-medium tracking-wide text-emerald-500 uppercase">
                    {t('settings.credits.photos', { biome: t(`biome.${biome}`) })}
                  </h3>
                  <ul className="space-y-1">
                    {species.map((s) => (
                      <li key={s.id}>
                        <span className="text-emerald-100">{speciesName(s, i18n.language)}</span>
                        {' — '}
                        <a href={s.photo.sourceUrl} target="_blank" rel="noreferrer" className={linkClass}>
                          {s.photo.credit}
                        </a>
                        {`, ${s.photo.license}`}
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
          <button
            onClick={close}
            className="press mt-4 shrink-0 rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 active:bg-emerald-700"
          >
            {t('common.close')}
          </button>
        </>
      )}
    </BottomSheet>
  )
}
