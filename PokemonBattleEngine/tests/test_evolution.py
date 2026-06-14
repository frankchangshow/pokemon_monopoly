import unittest

from pokemon_engine.data import load_roster
from pokemon_engine.evolution import evolution_paths, validate_evolution_graph


class EvolutionTests(unittest.TestCase):
    def test_fixture_evolution_paths_are_valid(self) -> None:
        roster = load_roster()
        self.assertEqual(validate_evolution_graph(roster), [])
        paths = evolution_paths(roster)
        self.assertIn(("sprigatito", "floragato", "meowscarada"), paths["sprigatito"])
        self.assertIn(("fuecoco", "crocalor", "skeledirge"), paths["fuecoco"])
        self.assertIn(("quaxly", "quaxwell", "quaquaval"), paths["quaxly"])

    def test_generated_paldea_evolution_graph_when_present(self) -> None:
        try:
            roster = load_roster("data/paldea_pokeapi.json")
        except FileNotFoundError:
            self.skipTest("Generated PokeAPI Paldea dataset is not present.")
        errors = validate_evolution_graph(roster, strict_sources=False)
        self.assertEqual(errors, [])
        wooper = next(pokemon for pokemon in roster if pokemon.name == "wooper-paldea")
        self.assertTrue(any(edge.to_species == "clodsire" for edge in wooper.evolutions))


if __name__ == "__main__":
    unittest.main()
