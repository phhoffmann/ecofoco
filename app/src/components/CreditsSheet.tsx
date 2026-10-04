import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { BIOME_IDS } from '../domain/biome'
import { SPECIES_CATALOG, speciesName } from '../domain/species'
import { BottomSheet } from './BottomSheet'
import { Button, Overline } from './ui'

// TODO: register src/catalog/gbif-derived-dataset.csv at https://www.gbif.org/derived-dataset/register
// and put the DOI it returns here (e.g. '10.15468/dd.xxxxxx').
export const GBIF_DERIVED_DATASET_DOI: string | null = null

const linkClass = 'font-bold text-accent underline underline-offset-2'

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
          <h2 id={titleId} className="mb-3 text-center text-title text-ink">
            {t('settings.credits.title')}
          </h2>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain text-caption text-ink-muted">
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
                  <h3 className="mb-1">
                    <Overline>{t('settings.credits.photos', { biome: t(`biome.${biome}`) })}</Overline>
                  </h3>
                  <ul className="space-y-1">
                    {species.map((s) => (
                      <li key={s.id}>
                        <span className="text-ink">{speciesName(s, i18n.language)}</span>
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
          <Button size="lg" onClick={close} className="mt-4 shrink-0">
            {t('common.close')}
          </Button>
        </>
      )}
    </BottomSheet>
  )
}
