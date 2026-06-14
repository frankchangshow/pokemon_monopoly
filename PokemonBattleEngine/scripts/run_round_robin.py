#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pokemon_engine.battle import simulate_round_robin
from pokemon_engine.data import load_roster


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ordered one-on-one battles for every Pokemon pair in a roster.")
    parser.add_argument("--data", default="data/paldea_fixture.json", help="Roster JSON path.")
    parser.add_argument("--output", default="reports/round_robin.json", help="Output report path.")
    parser.add_argument("--level", type=int, default=50, help="Battle level.")
    parser.add_argument("--max-turns", type=int, default=200, help="Maximum turns per battle.")
    parser.add_argument(
        "--move-strategy",
        choices=("best", "cycle", "random"),
        default="best",
        help="Move selection policy for simulations.",
    )
    parser.add_argument(
        "--weather",
        choices=("clear", "sun", "rain", "sandstorm", "snow"),
        default="clear",
        help="Battle weather applied to every simulation.",
    )
    parser.add_argument(
        "--terrain",
        choices=("none", "electric", "grassy", "misty", "psychic"),
        default="none",
        help="Battle terrain applied to every simulation.",
    )
    parser.add_argument(
        "--no-critical-hits",
        action="store_true",
        help="Disable critical-hit randomness for deterministic damage-only comparisons.",
    )
    args = parser.parse_args()

    roster = load_roster(args.data)
    results = simulate_round_robin(
        roster,
        level=args.level,
        max_turns=args.max_turns,
        move_strategy=args.move_strategy,
        weather=args.weather,
        terrain=args.terrain,
        critical_hits=not args.no_critical_hits,
    )
    summary = {
        "pokemon_count": len(roster),
        "ordered_battle_count": len(results),
        "level": args.level,
        "max_turns": args.max_turns,
        "move_strategy": args.move_strategy,
        "weather": args.weather,
        "terrain": args.terrain,
        "critical_hits": not args.no_critical_hits,
        "results": {
            key: {
                "outcome": result.outcome.value,
                "turns": result.turns,
                "winner": result.winner,
                "loser": result.loser,
                "event_count": len(result.events),
            }
            for key, result in sorted(results.items())
        },
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    print(f"Simulated {summary['ordered_battle_count']} battles for {summary['pokemon_count']} Pokemon.")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
