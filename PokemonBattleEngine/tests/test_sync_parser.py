import unittest

from scripts.sync_paldea_data import (
    extract_stat_changes,
    extract_status_effects,
    move_payload,
    select_diverse_moves,
    select_variety,
    walk_chain,
)


class SyncParserTests(unittest.TestCase):
    def test_extracts_move_stat_changes(self) -> None:
        move = {
            "target": {"name": "user"},
            "effect_chance": None,
            "stat_changes": [{"stat": {"name": "special-attack"}, "change": 1}],
            "meta": {"ailment": {"name": "none"}, "ailment_chance": 0},
        }
        self.assertEqual(
            extract_stat_changes(move),
            [{"target": "self", "stat": "special_attack", "stages": 1, "chance": 1.0}],
        )

    def test_extracts_status_effect_chance(self) -> None:
        move = {
            "target": {"name": "selected-pokemon"},
            "effect_chance": 10,
            "stat_changes": [],
            "meta": {"ailment": {"name": "burn"}, "ailment_chance": 10},
        }
        self.assertEqual(
            extract_status_effects(move),
            [{"target": "opponent", "status": "burn", "chance": 0.1}],
        )

    def test_selects_paldea_regional_variety_when_present(self) -> None:
        species = {
            "varieties": [
                {"is_default": True, "pokemon": {"name": "wooper"}},
                {"is_default": False, "pokemon": {"name": "wooper-paldea"}},
            ]
        }
        self.assertEqual(select_variety(species)["pokemon"]["name"], "wooper-paldea")

    def test_walk_chain_keeps_matching_regional_evolution_branch(self) -> None:
        chain = {
            "species": {"name": "wooper"},
            "evolves_to": [
                {
                    "species": {"name": "quagsire"},
                    "evolution_details": [{"trigger": {"name": "level-up"}, "min_level": 20}],
                    "evolves_to": [],
                },
                {
                    "species": {"name": "clodsire"},
                    "evolution_details": [
                        {"trigger": {"name": "level-up"}, "min_level": 20, "base_form": {"name": "wooper-paldea"}}
                    ],
                    "evolves_to": [],
                },
            ],
        }
        evolutions = []
        walk_chain(chain, evolutions, "wooper-paldea")
        self.assertEqual(len(evolutions), 1)
        self.assertEqual(evolutions[0]["from_species"], "wooper-paldea")
        self.assertEqual(evolutions[0]["to_species"], "clodsire")

    def test_select_diverse_moves_prefers_category_coverage_before_duplicates(self) -> None:
        candidates = [
            ((4, 2, 3, 0, 90, 100, "strong-physical"), {"name": "strong-physical", "category": "physical"}),
            ((4, 2, 3, 0, 80, 100, "second-physical"), {"name": "second-physical", "category": "physical"}),
            ((3, 2, 3, 0, 70, 100, "special-hit"), {"name": "special-hit", "category": "special"}),
            ((2, 0, 2, 2, 0, 100, "status-boost"), {"name": "status-boost", "category": "status"}),
        ]
        selected = select_diverse_moves(candidates, 3)
        self.assertEqual([move["category"] for move in selected], ["physical", "special", "status"])

    def test_move_payload_preserves_secondary_effect_metadata(self) -> None:
        move = {
            "name": "test-drain",
            "type": {"name": "grass"},
            "damage_class": {"name": "special"},
            "power": 75,
            "accuracy": 100,
            "pp": 10,
            "priority": 0,
            "target": {"name": "selected-pokemon"},
            "stat_changes": [],
            "effect_chance": None,
            "meta": {
                "ailment": {"name": "confusion"},
                "ailment_chance": 30,
                "drain": 50,
                "healing": 0,
                "recoil": 0,
                "flinch_chance": 10,
                "confusion_chance": 30,
            },
        }
        payload = move_payload(move)
        self.assertEqual(payload["drain"], 50)
        self.assertEqual(payload["flinch_chance"], 0.1)
        self.assertEqual(payload["confusion_chance"], 0.3)

        move["meta"]["flinch_chance"] = 0
        move["meta"]["confusion_chance"] = 0
        payload = move_payload(move)
        self.assertEqual(payload["flinch_chance"], 0.0)
        self.assertEqual(payload["confusion_chance"], 0.0)


if __name__ == "__main__":
    unittest.main()
