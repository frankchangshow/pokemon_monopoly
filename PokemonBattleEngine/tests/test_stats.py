import unittest

from pokemon_engine.models import Move, PokemonSpecies, PokemonState, normalize_evs


class StatFormulaTests(unittest.TestCase):
    def test_official_level_50_stat_formula_with_iv_ev_and_nature(self) -> None:
        species = PokemonSpecies(
            id=100,
            name="stat-test",
            types=("normal",),
            base_stats={"hp": 100, "attack": 100, "defense": 100, "special_attack": 100, "special_defense": 100, "speed": 100},
            moves=(Move("tackle", "normal", "physical", 40),),
        )
        pokemon = PokemonState(species, level=50, evs={"attack": 252, "speed": 252}, nature="jolly")
        self.assertEqual(pokemon.max_hp, 175)
        self.assertEqual(pokemon.calculated_stat("attack"), 152)
        self.assertEqual(pokemon.calculated_stat("special_attack"), 108)
        self.assertEqual(pokemon.calculated_stat("speed"), 167)

    def test_iv_and_ev_values_are_clamped(self) -> None:
        species = PokemonSpecies(
            id=101,
            name="clamp-test",
            types=("normal",),
            base_stats={"hp": 1, "attack": 1, "defense": 1, "special_attack": 1, "special_defense": 1, "speed": 1},
            moves=(Move("tackle", "normal", "physical", 40),),
        )
        pokemon = PokemonState(
            species,
            ivs={"hp": 99, "attack": -1},
            evs={"hp": 999, "attack": 999, "defense": 999, "special_attack": 999, "special_defense": 999, "speed": 999},
        )
        self.assertEqual(pokemon.ivs["hp"], 31)
        self.assertEqual(pokemon.ivs["attack"], 0)
        self.assertEqual(sum(pokemon.evs.values()), 510)
        self.assertEqual(normalize_evs({"hp": 252, "attack": 252, "speed": 6})["speed"], 6)


if __name__ == "__main__":
    unittest.main()
