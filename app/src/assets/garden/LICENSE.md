# Garden sprites

The sprites in this folder are baked by `npm run bake:garden` (`scripts/bake-garden-sprites.ts`) from CC0 3D
models: each model is rendered with one fixed orthographic camera and one lighting setup, recoloured to a shared
palette, and saved as a transparent WebP. `sprites.json` holds each sprite's size and foot point. What gets
rendered, and from which model, is listed in `scripts/garden-bake/sprites.ts`.

All source models are licensed **CC0 1.0 (public domain)** —
http://creativecommons.org/publicdomain/zero/1.0/. Credit is not required; it's given here anyway.

| Sprite | Source | Model |
|---|---|---|
| `flowering-tree` | Kenney Nature Kit 2.1 | `tree_default` (leaves recoloured) |
| `broadleaf-tree` | Kenney Nature Kit 2.1 | `tree_oak` |
| `emergent-tree` | Kenney Nature Kit 2.1 | `tree_plateau` |
| `pioneer-tree` | Kenney Nature Kit 2.1 | `tree_thin` |
| `palm` | Kenney Nature Kit 2.1 | `tree_palmDetailedTall` |
| `shrub` | Kenney Nature Kit 2.1 | `plant_bushDetailed` |
| `stage-sapling` | Kenney Nature Kit 2.1 | `crops_leafsStageA` |
| `decor-grass` | Kenney Nature Kit 2.1 | `grass_large` |
| `decor-flowers` | Kenney Nature Kit 2.1 | `flower_redC` (petals recoloured) |
| `decor-rock` | Kenney Nature Kit 2.1 | `stone_smallA` |
| `decor-cactus` | Kenney Nature Kit 2.1 | `cactus_short` |
| `decor-mushroom` | Kenney Nature Kit 2.1 | `mushroom_redGroup` |
| `decor-lily` | Kenney Nature Kit 2.1 | `lily_small` |
| `primate` | Kenney Cube Pets 2.0 | `animal-monkey` |
| `songbird` | Kenney Cube Pets 2.0 | `animal-chick` |
| `large-bird` | Kenney Cube Pets 2.0 | `animal-parrot` |
| `small-mammal` | Kenney Cube Pets 2.0 | `animal-bunny` |
| `mid-mammal` | Kenney Cube Pets 2.0 | `animal-fox` |
| `insect` | Kenney Cube Pets 2.0 | `animal-bee` |
| `reptile` | EcoFoco (original) | blocky lizard built in `scripts/garden-bake/procedural.js` |
| `stage-seedling` | EcoFoco (original) | seedling built in `scripts/garden-bake/procedural.js` |

The two original models are dedicated to the public domain under the same CC0 1.0 terms.

Packs: https://kenney.nl/assets/nature-kit · https://kenney.nl/assets/cube-pets

The bake page loads [three.js](https://threejs.org) (MIT) from a CDN at bake time; it is not part of the app.
