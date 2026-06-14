#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pokemon_engine.battle import can_apply_status
from pokemon_engine.data import load_roster
from pokemon_engine.models import PokemonState
from pokemon_engine.type_chart import TYPES, type_multiplier


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify every Pokemon/Tera/attack-type defensive matrix.")
    parser.add_argument("--data", default="data/paldea_pokeapi.json", help="Roster JSON path.")
    parser.add_argument("--output", default="reports/paldea_tera_matrix.json", help="Output report path.")
    args = parser.parse_args()

    roster = load_roster(args.data)
    multiplier_counts: Counter[str] = Counter()
    status_immunity_counts: Counter[str] = Counter()
    failures: list[str] = []

    for species in roster:
        for tera_type in TYPES:
            state = PokemonState(species, tera_type=tera_type, terastallized=True)
            if state.defensive_types != (tera_type,):
                failures.append(f"{species.name} did not become pure {tera_type}")
            for attack_type in TYPES:
                multiplier = type_multiplier(attack_type, state.defensive_types)
                multiplier_counts[f"{multiplier:g}"] += 1
            for status in ("burn", "paralysis", "poison", "freeze"):
                if not can_apply_status(status, state):
                    status_immunity_counts[status] += 1

    summary = {
        "pokemon_count": len(roster),
        "tera_types": len(TYPES),
        "attack_types": len(TYPES),
        "matrix_entries": len(roster) * len(TYPES) * len(TYPES),
        "status_checks": len(roster) * len(TYPES) * 4,
        "multiplier_counts": dict(sorted(multiplier_counts.items())),
        "status_immunity_counts": dict(sorted(status_immunity_counts.items())),
        "failure_count": len(failures),
        "failure_samples": failures[:20],
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    print(f"Verified {summary['matrix_entries']} Tera type matrix entries.")
    print(f"Failures: {summary['failure_count']}")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
