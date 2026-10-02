# EcoFoco Domain

The core domain of a focus-lock app where staying off the phone grows plants, and real-world physical activity or direct observation unlocks animals — everything the user gathers lives in a single, permanent Collection.

## Language

### Focus & growth

**FocusSession**:
A timed period where the phone is locked; completing it without leaving the app grows a Sprout into a permanent CollectedEntry, leaving early discards it.
_Avoid_: focus timer, lock session

**Sprout**:
The in-progress growth of a Plant during an active FocusSession. Not yet permanent — it only becomes a CollectedEntry if the session completes, and is discarded if the session fails. Shown in the UI as it grows.
_Avoid_: growing plant, temp plant

### Collecting

**Species**:
A definition of one plant or animal kind that can be collected — has a type (Plant or Animal), a Rarity, and one or more Biome tags. A Species is a catalog definition, not something a user owns.
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
A tier (Common, Rare, Epic) assigned to a Species that weights how likely it is to be selected in a Draw.

**Biome**:
A real-world ecological region (in Brazil, IBGE's six: Amazon, Atlantic Forest, Caatinga, Cerrado, Pantanal, Pampa), defined as a curated group of RESOLVE ecoregions and tagged on each Species. The user's **home** Biome comes from their location (or a manual pick) and starts unlocked; points from completed FocusSessions and met StepGoals unlock **neighbouring** Biomes. Everything the user collects — Sprouts, Draws, Manual Sightings — comes from their **current** Biome, which can be switched only to an unlocked one.

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
The record of one calendar day: steps taken, whether the StepGoal was met, and whether a Draw has already happened that day.
_Avoid_: DailyStepGoal

**Draw**:
The event where one random Animal Species is selected and added as a CollectedEntry, weighted by Rarity. Triggered at most once per day, when DailyProgress shows the StepGoal was met.
_Avoid_: sorteio, roll, pull, lottery
