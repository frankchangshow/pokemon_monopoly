# Pokemon Battle Engine

This project is a deterministic Pokemon battle engine scaffolded for Paldea-region data.

## What is implemented

- Official core stat names: `hp`, `attack`, `defense`, `special_attack`, `special_defense`, `speed`
- Battle stats: health/current HP, status condition, stat stages, selected moves
- Type effectiveness for all 18 Pokemon types
- Physical/special/status moves
- Stat-stage upgrades and downgrades
- Major status effects: burn, paralysis, poison, badly poisoned, sleep, freeze
- Deterministic turn order and seeded simulations
- Evolution chain representation
- Roster round-robin battle simulation
- PokeAPI sync script for Paldea data hydration

## Data

`data/paldea_fixture.json` is a small offline fixture so the engine and tests run without internet access.

To fetch a fuller Generation IX / Paldea-oriented dataset when network access is available:

```bash
python3 scripts/sync_paldea_data.py --output data/paldea_pokeapi.json
```

PokeAPI Generation 9 currently includes species introduced in Scarlet/Violet, not every Pokemon available in the Paldea regional dex. The sync script records that source distinction in `metadata`.

## Test

```bash
python3 -m unittest discover -s tests
```

