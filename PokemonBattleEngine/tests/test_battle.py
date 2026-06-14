import unittest

from pokemon_engine.battle import Battle, BattleSettings, battle_stat, calculate_damage, modified_accuracy, simulate_round_robin
from pokemon_engine.data import load_roster
from pokemon_engine.models import BattleOutcome, Move, PokemonSpecies, PokemonState


class BattleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.roster = load_roster()
        cls.by_name = {pokemon.name: pokemon for pokemon in cls.roster}

    def test_roster_loads_with_official_stats_and_moves(self) -> None:
        self.assertGreaterEqual(len(self.roster), 12)
        for species in self.roster:
            with self.subTest(species=species.name):
                self.assertEqual(
                    set(species.base_stats),
                    {"hp", "attack", "defense", "special_attack", "special_defense", "speed"},
                )
                self.assertTrue(species.types)
                self.assertTrue(species.moves)

    def test_type_advantage_affects_damage(self) -> None:
        fuecoco = PokemonState(self.by_name["fuecoco"])
        sprigatito = PokemonState(self.by_name["sprigatito"])
        quaxly = PokemonState(self.by_name["quaxly"])
        ember = fuecoco.species.moves[0]
        grass_damage, _ = calculate_damage(fuecoco, sprigatito, ember, BattleSettings(critical_hits=False))
        water_damage, _ = calculate_damage(fuecoco, quaxly, ember, BattleSettings(critical_hits=False))
        self.assertGreater(grass_damage, water_damage)

    def test_stat_boost_move_changes_stage(self) -> None:
        skeledirge = PokemonState(self.by_name["skeledirge"])
        target = PokemonState(self.by_name["meowscarada"])
        battle = Battle(skeledirge, target, BattleSettings(seed=4, max_turns=1))
        result = battle.run()
        self.assertIn(result.outcome, set(BattleOutcome))
        self.assertGreaterEqual(skeledirge.stat_stages["special_attack"], 1)

    def test_status_immunities(self) -> None:
        fuecoco = PokemonState(self.by_name["fuecoco"])
        fuecoco.status = "burn"
        before = fuecoco.calculated_stat("attack")
        self.assertLess(before, PokemonState(self.by_name["fuecoco"]).calculated_stat("attack"))

    def test_type_immunity_does_zero_damage(self) -> None:
        normal = PokemonSpecies(
            id=1,
            name="normal-attacker",
            types=("normal",),
            base_stats={"hp": 80, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 80},
            moves=(Move("tackle", "normal", "physical", 40, 100),),
        )
        ghost = PokemonSpecies(
            id=2,
            name="ghost-defender",
            types=("ghost",),
            base_stats={"hp": 80, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 1},
            moves=(Move("lick", "ghost", "physical", 30, 100),),
        )
        defender = PokemonState(ghost)
        result = Battle(PokemonState(normal), defender, BattleSettings(max_turns=1)).run()
        first_event = result.events[0]
        self.assertEqual(first_event.damage, 0)
        self.assertEqual(defender.current_hp, defender.max_hp)

    def test_pp_decreases_and_cycle_strategy_uses_status_moves(self) -> None:
        sprigatito = PokemonState(self.by_name["sprigatito"])
        fuecoco = PokemonState(self.by_name["fuecoco"])
        Battle(sprigatito, fuecoco, BattleSettings(seed=3, max_turns=2, move_strategy="cycle")).run()
        self.assertLess(sprigatito.move_pp["leafage"], sprigatito.species.moves[0].pp)
        self.assertLess(sprigatito.move_pp["hone-claws"], sprigatito.species.moves[1].pp)
        self.assertGreaterEqual(sprigatito.stat_stages["attack"], 1)

    def test_accuracy_and_evasion_stages_modify_accuracy(self) -> None:
        attacker = PokemonState(self.by_name["sprigatito"])
        defender = PokemonState(self.by_name["fuecoco"])
        move = Move("test-hit", "normal", "physical", 40, 60)
        self.assertEqual(modified_accuracy(move, attacker, defender), 60)
        attacker.stat_stages["accuracy"] = 2
        self.assertGreater(modified_accuracy(move, attacker, defender), 60)
        defender.stat_stages["evasion"] = 6
        self.assertLess(modified_accuracy(move, attacker, defender), 60)

    def test_weather_terrain_items_and_abilities_modify_damage(self) -> None:
        fuecoco = PokemonState(self.by_name["fuecoco"], ability="blaze", held_item="charcoal")
        sprigatito = PokemonState(self.by_name["sprigatito"])
        fuecoco.current_hp = fuecoco.max_hp // 3
        ember = fuecoco.species.moves[0]
        base, _ = calculate_damage(fuecoco, sprigatito, ember, BattleSettings(critical_hits=False))
        boosted, notes = calculate_damage(
            fuecoco,
            sprigatito,
            ember,
            BattleSettings(weather="sun", critical_hits=False),
        )
        self.assertGreater(boosted, base)
        self.assertTrue(any("environment" in note for note in notes))
        self.assertTrue(any("item" in note for note in notes))
        self.assertTrue(any("ability" in note for note in notes))

    def test_starting_abilities_set_weather_and_terrain(self) -> None:
        koraidon = PokemonSpecies(
            id=18,
            name="koraidon-test",
            types=("fighting", "dragon"),
            base_stats={"hp": 100, "attack": 100, "defense": 100, "special_attack": 100, "special_defense": 100, "speed": 100},
            moves=(Move("flame-charge", "fire", "physical", 50, 100),),
            abilities=("orichalcum-pulse",),
        )
        miraidon = PokemonSpecies(
            id=19,
            name="miraidon-test",
            types=("electric", "dragon"),
            base_stats={"hp": 100, "attack": 100, "defense": 100, "special_attack": 100, "special_defense": 100, "speed": 90},
            moves=(Move("thunderbolt", "electric", "special", 90, 100),),
            abilities=("hadron-engine",),
        )
        battle = Battle(
            PokemonState(koraidon),
            PokemonState(miraidon),
            BattleSettings(max_turns=1, move_strategy="cycle", critical_hits=False),
        )
        result = battle.run()
        self.assertEqual(battle.settings.weather, "sun")
        self.assertEqual(battle.settings.terrain, "electric")
        self.assertTrue(any(event.turn == 0 and "weather sun" in event.note for event in result.events))
        self.assertTrue(any(event.turn == 0 and "terrain electric" in event.note for event in result.events))

    def test_weather_and_terrain_abilities_boost_relevant_stats(self) -> None:
        koraidon = PokemonSpecies(
            id=25,
            name="koraidon-boost",
            types=("fighting", "dragon"),
            base_stats={"hp": 100, "attack": 120, "defense": 100, "special_attack": 80, "special_defense": 100, "speed": 90},
            moves=(Move("close-combat", "fighting", "physical", 120, 100),),
            abilities=("orichalcum-pulse",),
        )
        miraidon = PokemonSpecies(
            id=26,
            name="miraidon-boost",
            types=("electric", "dragon"),
            base_stats={"hp": 100, "attack": 80, "defense": 100, "special_attack": 120, "special_defense": 100, "speed": 90},
            moves=(Move("thunderbolt", "electric", "special", 90, 100),),
            abilities=("hadron-engine",),
        )
        target = PokemonSpecies(
            id=27,
            name="boost-target",
            types=("normal",),
            base_stats={"hp": 100, "attack": 80, "defense": 100, "special_attack": 80, "special_defense": 100, "speed": 90},
            moves=(Move("tackle", "normal", "physical", 40, 100),),
        )
        koraidon_state = PokemonState(koraidon)
        miraidon_state = PokemonState(miraidon)
        target_state = PokemonState(target)
        sun = BattleSettings(weather="sun", critical_hits=False)
        electric = BattleSettings(terrain="electric", critical_hits=False)
        self.assertGreater(battle_stat(koraidon_state, "attack", sun), koraidon_state.calculated_stat("attack"))
        self.assertGreater(battle_stat(miraidon_state, "special_attack", electric), miraidon_state.calculated_stat("special_attack"))
        base_damage, _ = calculate_damage(koraidon_state, target_state, koraidon.moves[0], BattleSettings(critical_hits=False))
        boosted_damage, _ = calculate_damage(koraidon_state, target_state, koraidon.moves[0], sun)
        self.assertGreater(boosted_damage, base_damage)

    def test_weather_speed_ability_changes_turn_order(self) -> None:
        slow_chlorophyll = PokemonSpecies(
            id=28,
            name="slow-chlorophyll",
            types=("grass",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 40},
            moves=(Move("leafage", "grass", "physical", 40, 100),),
            abilities=("chlorophyll",),
        )
        fast_target = PokemonSpecies(
            id=29,
            name="fast-target",
            types=("normal",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 70},
            moves=(Move("tackle", "normal", "physical", 40, 100),),
        )
        result = Battle(
            PokemonState(slow_chlorophyll),
            PokemonState(fast_target),
            BattleSettings(max_turns=1, weather="sun", move_strategy="cycle", critical_hits=False, seed=1),
        ).run()
        first_non_setup = next(event for event in result.events if event.turn == 1)
        self.assertEqual(first_non_setup.actor, "slow-chlorophyll")

    def test_levitate_grants_ground_immunity(self) -> None:
        ground_attacker = PokemonSpecies(
            id=3,
            name="ground-attacker",
            types=("ground",),
            base_stats={"hp": 80, "attack": 100, "defense": 80, "special_attack": 50, "special_defense": 80, "speed": 80},
            moves=(Move("earthquake", "ground", "physical", 100, 100),),
        )
        floating_defender = PokemonSpecies(
            id=4,
            name="floating-defender",
            types=("electric",),
            base_stats={"hp": 80, "attack": 50, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 80},
            moves=(Move("spark", "electric", "physical", 65, 100),),
        )
        attacker = PokemonState(ground_attacker)
        defender = PokemonState(floating_defender, ability="levitate")
        ground = Move("earthquake", "ground", "physical", 100, 100)
        damage, notes = calculate_damage(attacker, defender, ground, BattleSettings(critical_hits=False))
        self.assertEqual(damage, 0)
        self.assertIn("x0", notes)

    def test_tera_changes_defensive_type_effectiveness(self) -> None:
        grass = PokemonSpecies(
            id=20,
            name="tera-grass",
            types=("grass",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 80},
            moves=(Move("leafage", "grass", "physical", 40, 100),),
        )
        fire = PokemonSpecies(
            id=21,
            name="fire-attacker",
            types=("fire",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 80},
            moves=(Move("flamethrower", "fire", "special", 90, 100),),
        )
        normal_defender = PokemonState(grass)
        tera_water_defender = PokemonState(grass, tera_type="water", terastallized=True)
        attacker = PokemonState(fire)
        move = fire.moves[0]
        normal_damage, normal_notes = calculate_damage(attacker, normal_defender, move, BattleSettings(critical_hits=False))
        tera_damage, tera_notes = calculate_damage(attacker, tera_water_defender, move, BattleSettings(critical_hits=False))
        self.assertGreater(normal_damage, tera_damage)
        self.assertIn("x2", normal_notes)
        self.assertIn("x0.5", tera_notes)

    def test_tera_stab_same_original_type_is_double_bonus(self) -> None:
        species = PokemonSpecies(
            id=22,
            name="tera-fire",
            types=("fire",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 100, "special_defense": 80, "speed": 80},
            moves=(Move("flamethrower", "fire", "special", 90, 100),),
        )
        target = PokemonSpecies(
            id=23,
            name="neutral-target",
            types=("normal",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 80},
            moves=(Move("tackle", "normal", "physical", 40, 100),),
        )
        normal_damage, _ = calculate_damage(PokemonState(species), PokemonState(target), species.moves[0], BattleSettings(critical_hits=False))
        tera_damage, _ = calculate_damage(
            PokemonState(species, tera_type="fire", terastallized=True),
            PokemonState(target),
            species.moves[0],
            BattleSettings(critical_hits=False),
        )
        self.assertGreater(tera_damage, normal_damage)

    def test_tera_defensive_type_changes_status_immunity(self) -> None:
        fire_species = PokemonSpecies(
            id=24,
            name="tera-fire-status",
            types=("fire",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 80},
            moves=(Move("ember", "fire", "special", 40, 100),),
        )
        normal_fire = PokemonState(fire_species)
        tera_grass = PokemonState(fire_species, tera_type="grass", terastallized=True)
        from pokemon_engine.battle import can_apply_status

        self.assertFalse(can_apply_status("burn", normal_fire))
        self.assertTrue(can_apply_status("burn", tera_grass))

    def test_every_fixture_pokemon_battles_every_other_fixture_pokemon(self) -> None:
        results = simulate_round_robin(self.roster, max_turns=100)
        expected = len(self.roster) * (len(self.roster) - 1)
        self.assertEqual(len(results), expected)
        for key, result in results.items():
            with self.subTest(matchup=key):
                self.assertIn(result.outcome, set(BattleOutcome))
                self.assertGreater(result.turns, 0)
                self.assertLessEqual(result.turns, 100)

    def test_every_fixture_pokemon_battles_every_other_with_cycle_strategy(self) -> None:
        results = simulate_round_robin(self.roster, max_turns=100, move_strategy="cycle")
        expected = len(self.roster) * (len(self.roster) - 1)
        self.assertEqual(len(results), expected)
        self.assertTrue(all(result.turns <= 100 for result in results.values()))

    def test_fixed_strategy_forces_named_move_pair(self) -> None:
        sprigatito = PokemonState(self.by_name["sprigatito"])
        fuecoco = PokemonState(self.by_name["fuecoco"])
        result = Battle(
            sprigatito,
            fuecoco,
            BattleSettings(
                max_turns=1,
                move_strategy="fixed",
                p1_forced_move="hone-claws",
                p2_forced_move="leer",
                critical_hits=False,
            ),
        ).run()
        moves = {event.actor: event.move for event in result.events if event.move != "status"}
        self.assertEqual(moves["sprigatito"], "hone-claws")
        self.assertEqual(moves["fuecoco"], "leer")
        self.assertGreater(sprigatito.stat_stages["attack"], 0)

    def test_drain_recoil_and_life_orb_side_effects_apply(self) -> None:
        attacker_species = PokemonSpecies(
            id=10,
            name="drainer",
            types=("grass",),
            base_stats={"hp": 100, "attack": 100, "defense": 80, "special_attack": 100, "special_defense": 80, "speed": 80},
            moves=(Move("horn-leech", "grass", "physical", 75, 100, drain=50, recoil=25),),
        )
        defender_species = PokemonSpecies(
            id=11,
            name="target",
            types=("water",),
            base_stats={"hp": 120, "attack": 80, "defense": 70, "special_attack": 80, "special_defense": 70, "speed": 40},
            moves=(Move("splash-hit", "water", "special", 20, 100),),
        )
        attacker = PokemonState(attacker_species, held_item="life-orb")
        attacker.current_hp = attacker.max_hp // 2
        result = Battle(
            attacker,
            PokemonState(defender_species),
            BattleSettings(max_turns=1, move_strategy="fixed", p1_forced_move="horn-leech", p2_forced_move="splash-hit", critical_hits=False),
        ).run()
        note = " ".join(event.note for event in result.events)
        self.assertIn("drain", note)
        self.assertIn("recoil", note)
        self.assertIn("life-orb", note)

    def test_status_healing_move_restores_hp(self) -> None:
        healer_species = PokemonSpecies(
            id=12,
            name="healer",
            types=("normal",),
            base_stats={"hp": 100, "attack": 50, "defense": 80, "special_attack": 50, "special_defense": 80, "speed": 90},
            moves=(Move("recover", "normal", "status", None, None, healing=50),),
        )
        defender_species = PokemonSpecies(
            id=13,
            name="slow-target",
            types=("normal",),
            base_stats={"hp": 100, "attack": 50, "defense": 80, "special_attack": 50, "special_defense": 80, "speed": 1},
            moves=(Move("tackle", "normal", "physical", 10, 100),),
        )
        healer = PokemonState(healer_species)
        healer.current_hp = healer.max_hp // 2
        Battle(
            healer,
            PokemonState(defender_species),
            BattleSettings(max_turns=1, move_strategy="fixed", p1_forced_move="recover", p2_forced_move="tackle", critical_hits=False),
        ).run()
        self.assertGreater(healer.current_hp or 0, healer.max_hp // 2)

    def test_flinch_can_block_second_actor(self) -> None:
        fast_species = PokemonSpecies(
            id=14,
            name="fast",
            types=("normal",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 100},
            moves=(Move("fake-out", "normal", "physical", 40, 100, flinch_chance=1.0),),
        )
        slow_species = PokemonSpecies(
            id=15,
            name="slow",
            types=("normal",),
            base_stats={"hp": 100, "attack": 80, "defense": 80, "special_attack": 80, "special_defense": 80, "speed": 1},
            moves=(Move("tackle", "normal", "physical", 40, 100),),
        )
        result = Battle(
            PokemonState(fast_species),
            PokemonState(slow_species),
            BattleSettings(max_turns=1, move_strategy="fixed", p1_forced_move="fake-out", p2_forced_move="tackle", critical_hits=False),
        ).run()
        self.assertTrue(any(event.note == "flinched" for event in result.events))

    def test_sandstorm_damage_and_grassy_terrain_healing_apply(self) -> None:
        normal_species = PokemonSpecies(
            id=16,
            name="normal-weather",
            types=("normal",),
            base_stats={"hp": 100, "attack": 1, "defense": 100, "special_attack": 1, "special_defense": 100, "speed": 50},
            moves=(Move("growl", "normal", "status", None, None),),
        )
        rock_species = PokemonSpecies(
            id=17,
            name="rock-weather",
            types=("rock",),
            base_stats={"hp": 100, "attack": 1, "defense": 100, "special_attack": 1, "special_defense": 100, "speed": 1},
            moves=(Move("harden", "normal", "status", None, None),),
        )
        normal = PokemonState(normal_species)
        rock = PokemonState(rock_species)
        Battle(
            normal,
            rock,
            BattleSettings(max_turns=1, move_strategy="cycle", weather="sandstorm", terrain="none", critical_hits=False),
        ).run()
        self.assertLess(normal.current_hp or 0, normal.max_hp)
        self.assertEqual(rock.current_hp, rock.max_hp)

        normal.current_hp = normal.max_hp // 2
        Battle(
            normal,
            rock,
            BattleSettings(max_turns=1, move_strategy="cycle", weather="clear", terrain="grassy", critical_hits=False),
        ).run()
        self.assertGreater(normal.current_hp or 0, normal.max_hp // 2)


if __name__ == "__main__":
    unittest.main()
