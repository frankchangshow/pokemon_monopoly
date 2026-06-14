import unittest

from pokemon_engine.type_chart import TYPES, type_multiplier


class TypeChartTests(unittest.TestCase):
    def test_all_type_pairs_return_known_multiplier(self) -> None:
        allowed = {0.0, 0.25, 0.5, 1.0, 2.0, 4.0}
        for attack_type in TYPES:
            for defender_type in TYPES:
                with self.subTest(attack_type=attack_type, defender_type=defender_type):
                    self.assertIn(type_multiplier(attack_type, (defender_type,)), allowed)

    def test_key_immunities(self) -> None:
        self.assertEqual(type_multiplier("normal", ("ghost",)), 0.0)
        self.assertEqual(type_multiplier("electric", ("ground",)), 0.0)
        self.assertEqual(type_multiplier("dragon", ("fairy",)), 0.0)

    def test_dual_type_stack(self) -> None:
        self.assertEqual(type_multiplier("water", ("fire", "rock")), 4.0)
        self.assertEqual(type_multiplier("grass", ("fire", "flying")), 0.25)


if __name__ == "__main__":
    unittest.main()
