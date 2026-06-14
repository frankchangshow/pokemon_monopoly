#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pokemon_engine.battle import BattleSettings, TeamBattle
from pokemon_engine.data import load_roster
from pokemon_engine.models import PokemonState


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ordered team battles over deterministic roster partitions.")
    parser.add_argument("--data", default="data/paldea_pokeapi.json", help="Roster JSON path.")
    parser.add_argument("--output", default="reports/paldea_team_round_robin.json", help="Output report path.")
    parser.add_argument("--team-size", type=int, default=6, help="Pokemon per team.")
    parser.add_argument("--level", type=int, default=50, help="Battle level.")
    parser.add_argument("--max-turns", type=int, default=300, help="Maximum turns per team battle.")
    parser.add_argument("--move-strategy", choices=("best", "cycle", "random"), default="best")
    args = parser.parse_args()

    roster = load_roster(args.data)
    teams = [roster[index : index + args.team_size] for index in range(0, len(roster), args.team_size)]
    results = {}
    for i, team1 in enumerate(teams):
        for j, team2 in enumerate(teams):
            if i == j:
                continue
            battle = TeamBattle(
                [PokemonState(species, level=args.level) for species in team1],
                [PokemonState(species, level=args.level) for species in team2],
                BattleSettings(max_turns=args.max_turns, seed=i * 10_000 + j, move_strategy=args.move_strategy),
            )
            result = battle.run()
            results[f"team_{i + 1}_vs_team_{j + 1}"] = {
                "outcome": result.outcome.value,
                "turns": result.turns,
                "winner": result.winner,
                "loser": result.loser,
                "event_count": len(result.events),
            }

    summary = {
        "pokemon_count": len(roster),
        "team_size": args.team_size,
        "team_count": len(teams),
        "ordered_team_battle_count": len(results),
        "level": args.level,
        "max_turns": args.max_turns,
        "move_strategy": args.move_strategy,
        "results": results,
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    print(f"Simulated {len(results)} ordered team battles over {len(teams)} teams.")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
