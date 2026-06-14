import json
import unittest
from pathlib import Path

from pokemon_engine.data import load_roster


class DataContractTests(unittest.TestCase):
    def test_fixture_metadata_documents_scope(self) -> None:
        raw = json.loads(Path("data/paldea_fixture.json").read_text())
        self.assertIn("metadata", raw)
        self.assertIn("scope", raw["metadata"])
        self.assertIn("source", raw["metadata"])

    def test_evolution_edges_point_to_named_species_or_external_future_data(self) -> None:
        roster = load_roster()
        names = {pokemon.name for pokemon in roster}
        for pokemon in roster:
            for evolution in pokemon.evolutions:
                with self.subTest(edge=f"{evolution.from_species}->{evolution.to_species}"):
                    self.assertIn(evolution.from_species, names)
                    self.assertTrue(evolution.to_species)

    def test_generated_paldea_dataset_when_present(self) -> None:
        path = Path("data/paldea_pokeapi.json")
        if not path.exists():
            self.skipTest("Generated PokeAPI Paldea dataset is not present.")
        roster = load_roster(path)
        by_name = {pokemon.name: pokemon for pokemon in roster}
        self.assertEqual(len(roster), 400)
        self.assertEqual(by_name["wooper-paldea"].types, ("poison", "ground"))
        self.assertEqual(by_name["tauros-paldea-combat-breed"].types, ("fighting",))
        self.assertTrue(all(pokemon.moves for pokemon in roster))
        self.assertTrue(all(pokemon.abilities for pokemon in roster))
        self.assertEqual(by_name["sprigatito"].abilities[0], "overgrow")
        self.assertGreaterEqual(sum(len(pokemon.moves) for pokemon in roster), 1500)
        self.assertEqual({move.type for pokemon in roster for move in pokemon.moves}, {
            "bug",
            "dark",
            "dragon",
            "electric",
            "fairy",
            "fighting",
            "fire",
            "flying",
            "ghost",
            "grass",
            "ground",
            "ice",
            "normal",
            "poison",
            "psychic",
            "rock",
            "steel",
            "water",
        })
        self.assertGreaterEqual(
            sum(
                1
                for pokemon in roster
                for move in pokemon.moves
                if (
                    move.stat_changes
                    or move.status_effects
                    or move.drain
                    or move.healing
                    or move.recoil
                    or move.flinch_chance
                    or move.confusion_chance
                )
            ),
            1100,
        )


if __name__ == "__main__":
    unittest.main()
