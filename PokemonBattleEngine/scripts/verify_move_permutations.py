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

from pokemon_engine.battle import Battle, BattleSettings
from pokemon_engine.data import load_roster
from pokemon_engine.evolution import validate_evolution_graph
from pokemon_engine.models import PokemonState


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Verify every ordered matchup and every first-turn move pair for a roster."
    )
    parser.add_argument("--data", default="data/paldea_fixture.json", help="Roster JSON path.")
    parser.add_argument("--output", default="reports/move_permutations.json", help="Output report path.")
    parser.add_argument("--level", type=int, default=50, help="Battle level.")
    parser.add_argument("--max-turns", type=int, default=1, help="Turns to run for each forced move-pair battle.")
    parser.add_argument(
        "--weather",
        choices=("clear", "sun", "rain", "sandstorm", "snow"),
        default="clear",
        help="Battle weather.",
    )
    parser.add_argument(
        "--terrain",
        choices=("none", "electric", "grassy", "misty", "psychic"),
        default="none",
        help="Battle terrain.",
    )
    parser.add_argument("--sample-limit", type=int, default=20, help="Maximum failure/sample rows to store.")
    args = parser.parse_args()

    roster = load_roster(args.data)
    failures: list[dict[str, str]] = []
    outcomes: Counter[str] = Counter()
    total = 0
    damaging_events = 0
    status_or_stage_events = 0

    for i, p1 in enumerate(roster):
        for j, p2 in enumerate(roster):
            if i == j:
                continue
            for p1_move in p1.moves:
                for p2_move in p2.moves:
                    total += 1
                    try:
                        result = Battle(
                            PokemonState(p1, level=args.level),
                            PokemonState(p2, level=args.level),
                            BattleSettings(
                                max_turns=args.max_turns,
                                seed=i * 1_000_000 + j * 1_000 + total,
                                move_strategy="fixed",
                                p1_forced_move=p1_move.name,
                                p2_forced_move=p2_move.name,
                                weather=args.weather,
                                terrain=args.terrain,
                                critical_hits=False,
                            ),
                        ).run()
                    except Exception as exc:  # pragma: no cover - report path for unexpected data issues
                        if len(failures) < args.sample_limit:
                            failures.append(
                                {
                                    "p1": p1.name,
                                    "p2": p2.name,
                                    "p1_move": p1_move.name,
                                    "p2_move": p2_move.name,
                                    "error": str(exc),
                                }
                            )
                        continue
                    outcomes[result.outcome.value] += 1
                    if any(event.damage > 0 for event in result.events):
                        damaging_events += 1
                    if any(("+" in event.note or "-" in event.note or event.note.endswith(("burn", "poison", "paralysis", "sleep", "freeze"))) for event in result.events):
                        status_or_stage_events += 1

    evolution_errors = validate_evolution_graph(roster, strict_sources=False)
    summary = {
        "pokemon_count": len(roster),
        "ordered_matchups": len(roster) * (len(roster) - 1),
        "move_pair_permutations": total,
        "level": args.level,
        "max_turns": args.max_turns,
        "weather": args.weather,
        "terrain": args.terrain,
        "critical_hits": False,
        "outcomes": dict(sorted(outcomes.items())),
        "damaging_permutations": damaging_events,
        "status_or_stage_permutations": status_or_stage_events,
        "failure_count": len(failures),
        "failure_samples": failures,
        "evolution_error_count": len(evolution_errors),
        "evolution_errors": evolution_errors[: args.sample_limit],
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    print(f"Verified {total} move-pair permutations across {len(roster)} Pokemon.")
    print(f"Failures: {len(failures)}; evolution errors: {len(evolution_errors)}")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
