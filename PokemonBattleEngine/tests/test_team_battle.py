import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from pokemon_engine.battle import BattleSettings, TeamBattle
from pokemon_engine.models import BattleOutcome, Move, PokemonSpecies, PokemonState


def species(name: str, hp: int, attack: int, speed: int, move: Move) -> PokemonSpecies:
    return PokemonSpecies(
        id=abs(hash(name)) % 100000,
        name=name,
        types=(move.type,),
        base_stats={
            "hp": hp,
            "attack": attack,
            "defense": 40,
            "special_attack": attack,
            "special_defense": 40,
            "speed": speed,
        },
        moves=(move,),
    )


class TeamBattleTests(unittest.TestCase):
    def test_team_battle_switches_after_faint_and_continues(self) -> None:
        strong = species("strong", 80, 180, 100, Move("hit", "normal", "physical", 120, 100))
        weak_a = species("weak-a", 20, 10, 10, Move("tap", "normal", "physical", 10, 100))
        weak_b = species("weak-b", 20, 10, 10, Move("tap", "normal", "physical", 10, 100))
        result = TeamBattle(
            [PokemonState(weak_a), PokemonState(weak_b)],
            [PokemonState(strong)],
            BattleSettings(max_turns=10, move_strategy="cycle", critical_hits=False),
        ).run()
        self.assertEqual(result.outcome, BattleOutcome.P2_WIN)
        self.assertTrue(any(event.move == "switch" for event in result.events))

    def test_team_battle_starting_ability_applies_after_switch(self) -> None:
        opener = species("opener", 10, 1, 100, Move("tap", "normal", "physical", 10, 100))
        drought = PokemonSpecies(
            id=2,
            name="drought-switch",
            types=("fire",),
            base_stats={"hp": 100, "attack": 1, "defense": 100, "special_attack": 1, "special_defense": 100, "speed": 1},
            moves=(Move("ember", "fire", "special", 40, 100),),
            abilities=("drought",),
        )
        attacker = species("attacker", 100, 180, 90, Move("hit", "normal", "physical", 120, 100))
        battle = TeamBattle(
            [PokemonState(opener), PokemonState(drought)],
            [PokemonState(attacker)],
            BattleSettings(max_turns=5, move_strategy="cycle", critical_hits=False),
        )
        result = battle.run()
        self.assertEqual(battle.settings.weather, "sun")
        self.assertTrue(any("drought weather sun" in event.note for event in result.events))

    def test_team_round_robin_script_writes_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "teams.json"
            completed = subprocess.run(
                [
                    sys.executable,
                    "scripts/run_team_round_robin.py",
                    "--data",
                    "data/paldea_fixture.json",
                    "--output",
                    str(output),
                    "--team-size",
                    "4",
                    "--max-turns",
                    "80",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("Simulated", completed.stdout)
            report = json.loads(output.read_text())
            self.assertEqual(report["pokemon_count"], 12)
            self.assertEqual(report["team_count"], 3)
            self.assertEqual(report["ordered_team_battle_count"], 6)

    def test_generated_paldea_team_report_when_present(self) -> None:
        path = Path("reports/paldea_team_round_robin.json")
        if not path.exists():
            self.skipTest("Generated full Paldea team report is not present.")
        report = json.loads(path.read_text())
        self.assertEqual(report["pokemon_count"], 400)
        self.assertEqual(report["team_size"], 6)
        self.assertEqual(report["team_count"], 67)
        self.assertEqual(report["ordered_team_battle_count"], 4422)


if __name__ == "__main__":
    unittest.main()
