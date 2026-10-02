# Biome lookup grid

`ecoregion-grid.bin` is derived from **RESOLVE Ecoregions 2017** (Dinerstein et al., 2017,
"An Ecoregion-Based Approach to Protecting Half the Terrestrial Realm", *BioScience* 67(6)),
licensed **CC-BY 4.0** — https://creativecommons.org/licenses/by/4.0/. Credited in the app's Settings.

Changes from the source: the ecoregion polygons are rasterized to one RESOLVE `ECO_ID` per 0.1° cell
(the cell's center decides), and water cells within 3 cells of land take the nearest land ecoregion.
The `ECO_ID → Biome` table is `src/domain/ecoregionBiomes.ts`, generated from the curated groups in
`scripts/brazil-biome-ecoregions.ts`.

## Regenerating

The 149 MB source is not committed. With Node ≥ 22.18, from `app/`:

```sh
curl -LO https://storage.googleapis.com/teow2016/Ecoregions2017.zip
unzip Ecoregions2017.zip -d /tmp/resolve
npm run build:biome-grid -- /tmp/resolve/Ecoregions2017.shp
```

This rewrites both `ecoregion-grid.bin` and `src/domain/ecoregionBiomes.ts`; the output is deterministic.
