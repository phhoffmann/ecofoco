# EcoFoco Domain

The core domain of a focus-lock app where staying off the phone grows plants, and real-world physical activity or direct observation unlocks animals — everything the user gathers lives in a single, permanent Collection.

## Language

### Focus & growth

**FocusSession**:
A timed period where the user stays off the phone; completing it without leaving the app grows a Sprout into a permanent CollectedEntry, leaving early discards it. Today the app keeps the screen awake and any trip to the background fails the session; the planned native lock will let the screen turn off without failing (Forest-style).
_Avoid_: focus timer, lock session

**Sprout**:
The in-progress growth of a Plant during an active FocusSession. Not yet permanent — it only becomes a CollectedEntry if the session completes, and is discarded if the session fails. Shown in the UI as it grows.
_Avoid_: growing plant, temp plant

### Collecting

**Species**:
A definition of one plant or animal kind that can be collected — has a type (Plant or Animal), a Rarity, one or more Biome tags, and an Archetype. A Species is a catalog definition, not something a user owns.
_Avoid_: creature, animal/plant (when used generically for the catalog concept)

**Plant**:
A Species of type Plant. Collectible only by completing a FocusSession (via a Sprout) or logging a Manual Sighting.
_Avoid_: tree (not every Plant is a tree)

**Animal**:
A Species of type Animal. Collectible via a Draw, a Manual Sighting, or (planned) Photo Identification.

**CollectedEntry**:
A permanent record that one Species has been added to the user's Collection, along with how it was obtained: `focus_session`, `draw`, `manual_sighting`, or (planned) `photo_ai`.
_Avoid_: catch, item

**Collection**:
The full set of a user's CollectedEntry records across all Species. Permanent — entries never decay or get removed.

**Rarity**:
A tier (Common, Rare, Epic) assigned to a Species in each of its Biomes that weights how likely it is to be selected in a Draw there.

**Archetype**:
The growth form (Plants) or body plan (Animals) of a Species — e.g. flowering tree, palm, songbird, primate. The Garden draws one sprite per Archetype, not per Species.

### Biomes

**Biome**:
A real-world ecological region (in Brazil, IBGE's six: Amazon, Atlantic Forest, Caatinga, Cerrado, Pantanal, Pampa), defined as a curated group of RESOLVE ecoregions and tagged on each Species. A Biome is playable once the catalog has both Plants and Animals for it; the rest show as "coming soon".

**Home Biome**:
The Biome the user lives in, detected from a coarse location fix (only the Biome id is stored) or picked manually as a fallback. Always unlocked. A detected Home Biome stays unlocked after a later re-detect moves the home elsewhere; a picked one does not.
_Avoid_: starting biome

**Current Biome**:
The Biome everything the user collects comes from — Sprouts, Draws, Manual Sightings — and the one the Collection grid shows. Can be switched only to an unlocked Biome.
_Avoid_: active biome (fine in code, but this is the concept name)

**Neighbour Biome**:
A Biome that shares a land border inside Brazil with another (e.g. Caatinga borders Cerrado and Atlantic Forest). Only a neighbour of an already unlocked Biome can be unlocked.
_Avoid_: adjacent biome

**Points**:
The currency earned by completing a FocusSession or meeting the StepGoal for a day (10 each). The balance is derived — points earned minus points spent on Unlocks — not stored as a running total.
_Avoid_: XP, coins

**Unlock**:
Spending Points (100) to make a Neighbour Biome permanently available, with no travel needed. An unlocked Biome can become the Current Biome.

**Manual Sighting**:
A user-entered claim of having encountered a real Plant or Animal Species, added directly as a CollectedEntry with no automatic validation.
_Avoid_: sighting diary

**Photo Identification** (planned):
A future collection method where a photo is matched against a real Species — Plant or Animal — via computer vision, adding that exact matched Species as a CollectedEntry. Never produces a random result, unlike a Draw.
_Avoid_: photo_ai (fine as the internal method value, but this is the concept name)

### Activity tracking

**StepGoal**:
The fixed daily step-count threshold that, once met, makes the user eligible for a Draw.
_Avoid_: DailyStepGoal (conflates the fixed threshold with the day's record — see DailyProgress)

**DailyProgress**:
The record of one local calendar day: steps taken, whether the StepGoal was met, and whether a Draw has already happened that day.
_Avoid_: DailyStepGoal

**Draw**:
The event where one random Animal Species from the Current Biome is selected and added as a CollectedEntry, weighted by Rarity. Triggered at most once per day, when DailyProgress shows the StepGoal was met.
_Avoid_: sorteio, roll, pull, lottery

### Garden

**Garden**:
The isometric view of the Collection, an alternative to the grid on the Collection screen. Shows only the CollectedEntries from one Period, one sprite per entry by Archetype, on a Plot whose ground is tinted per Biome.
_Avoid_: isometric view (`isometric` is fine as the internal view value, but this is the concept name)

**Period**:
The time scope the Garden shows: one local day, week (Sunday-first) or month, browsable backwards and forwards.
_Avoid_: range, filter

**Plot**:
The square grid of tiles the Garden places entries on, one per tile, sized to fit the Period's entries (6×6 up to 8×8). When even the largest Plot is full, the earliest entries drop off so the latest stay visible.
_Avoid_: board, map
