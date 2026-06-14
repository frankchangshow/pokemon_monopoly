from __future__ import annotations

from dataclasses import dataclass, field, replace
import random

from pokemon_engine.models import BattleOutcome, Move, PokemonState, StatusName, TerrainName, WeatherName
from pokemon_engine.type_chart import type_multiplier


@dataclass(frozen=True)
class BattleSettings:
    max_turns: int = 200
    seed: int = 1
    move_strategy: str = "best"
    p1_forced_move: str | None = None
    p2_forced_move: str | None = None
    weather: WeatherName = "clear"
    terrain: TerrainName = "none"
    critical_hits: bool = True
    verbose: bool = False


@dataclass(frozen=True)
class TurnEvent:
    turn: int
    actor: str
    move: str
    target: str
    damage: int = 0
    note: str = ""


@dataclass(frozen=True)
class BattleResult:
    outcome: BattleOutcome
    turns: int
    winner: str | None
    loser: str | None
    events: tuple[TurnEvent, ...] = ()


@dataclass
class Battle:
    p1: PokemonState
    p2: PokemonState
    settings: BattleSettings = field(default_factory=BattleSettings)

    def run(self) -> BattleResult:
        rng = random.Random(self.settings.seed)
        self.settings, starting_events = apply_starting_abilities(self.p1, self.p2, self.settings)
        events: list[TurnEvent] = list(starting_events)
        for turn in range(1, self.settings.max_turns + 1):
            self.p1.flinched = False
            self.p2.flinched = False
            p1_move = choose_move(
                self.p1,
                self.p2,
                turn,
                self.settings.move_strategy,
                rng,
                self.settings,
                self.settings.p1_forced_move,
            )
            p2_move = choose_move(
                self.p2,
                self.p1,
                turn,
                self.settings.move_strategy,
                rng,
                self.settings,
                self.settings.p2_forced_move,
            )
            for actor, defender, move in self._turn_order(rng, p1_move, p2_move):
                if actor.fainted or defender.fainted:
                    continue
                event = self._execute_move(turn, actor, defender, move, rng)
                events.append(event)
                if defender.fainted:
                    return BattleResult(
                        outcome=BattleOutcome.P1_WIN if defender is self.p2 else BattleOutcome.P2_WIN,
                        turns=turn,
                        winner=actor.species.name,
                        loser=defender.species.name,
                        events=tuple(events),
                    )
            residual = self._apply_residual_status(turn)
            events.extend(residual)
            if self.p1.fainted and self.p2.fainted:
                return BattleResult(BattleOutcome.DRAW, turn, None, None, tuple(events))
            if self.p2.fainted:
                return BattleResult(BattleOutcome.P1_WIN, turn, self.p1.species.name, self.p2.species.name, tuple(events))
            if self.p1.fainted:
                return BattleResult(BattleOutcome.P2_WIN, turn, self.p2.species.name, self.p1.species.name, tuple(events))
        return BattleResult(BattleOutcome.TURN_LIMIT, self.settings.max_turns, None, None, tuple(events))

    def _turn_order(
        self, rng: random.Random, p1_move: Move, p2_move: Move
    ) -> tuple[tuple[PokemonState, PokemonState, Move], tuple[PokemonState, PokemonState, Move]]:
        p1_key = (p1_move.priority, battle_stat(self.p1, "speed", self.settings), rng.random())
        p2_key = (p2_move.priority, battle_stat(self.p2, "speed", self.settings), rng.random())
        if p1_key >= p2_key:
            return ((self.p1, self.p2, p1_move), (self.p2, self.p1, p2_move))
        return ((self.p2, self.p1, p2_move), (self.p1, self.p2, p1_move))

    def _execute_move(
        self,
        turn: int,
        actor: PokemonState,
        defender: PokemonState,
        move: Move,
        rng: random.Random,
    ) -> TurnEvent:
        blocked = self._status_blocks_action(actor, rng)
        if blocked:
            return TurnEvent(turn, actor.species.name, move.name, defender.species.name, note=blocked)

        actor.move_pp[move.name] = max(0, actor.move_pp.get(move.name, move.pp) - 1)
        accuracy = modified_accuracy(move, actor, defender)
        if accuracy is not None and rng.randint(1, 100) > accuracy:
            return TurnEvent(turn, actor.species.name, move.name, defender.species.name, note="miss")

        damage = 0
        notes: list[str] = []
        if move.category != "status" and move.power:
            damage, damage_notes = calculate_damage(actor, defender, move, self.settings, rng)
            defender.apply_damage(damage)
            notes.extend(damage_notes)
        secondary_notes = apply_move_side_effects(actor, defender, move, damage)
        notes.extend(secondary_notes)

        for change in move.stat_changes:
            if rng.random() <= change.chance:
                target = actor if change.target == "self" else defender
                current = target.stat_stages[change.stat]
                target.stat_stages[change.stat] = max(-6, min(6, current + change.stages))
                notes.append(f"{target.species.name} {change.stat} {change.stages:+d}")

        for effect in move.status_effects:
            if rng.random() <= effect.chance:
                target = actor if effect.target == "self" else defender
                if can_apply_status(effect.status, target):
                    target.status = effect.status
                    if effect.status == "sleep":
                        target.sleep_turns = rng.randint(1, 3)
                    notes.append(f"{target.species.name} {effect.status}")

        if move.flinch_chance and rng.random() <= move.flinch_chance and not defender.fainted:
            defender.flinched = True
            notes.append(f"{defender.species.name} flinch")

        if move.confusion_chance and rng.random() <= move.confusion_chance and defender.confused_turns == 0 and not defender.fainted:
            defender.confused_turns = rng.randint(2, 5)
            notes.append(f"{defender.species.name} confusion")

        return TurnEvent(turn, actor.species.name, move.name, defender.species.name, damage, "; ".join(notes))

    def _status_blocks_action(self, actor: PokemonState, rng: random.Random) -> str | None:
        if actor.flinched:
            actor.flinched = False
            return "flinched"
        if actor.status == "paralysis" and rng.random() < 0.25:
            return "fully paralyzed"
        if actor.status == "sleep":
            if actor.sleep_turns > 0:
                actor.sleep_turns -= 1
                return "asleep"
            actor.status = None
        if actor.status == "freeze":
            if rng.random() < 0.20:
                actor.status = None
            else:
                return "frozen"
        if actor.confused_turns > 0:
            actor.confused_turns -= 1
            if rng.random() < 1 / 3:
                damage = max(1, actor.max_hp // 8)
                actor.apply_damage(damage)
                return f"confused self-hit {damage}"
        return None

    def _apply_residual_status(self, turn: int) -> list[TurnEvent]:
        events: list[TurnEvent] = []
        for pokemon in (self.p1, self.p2):
            if pokemon.fainted:
                continue
            damage = residual_status_damage(pokemon)
            if damage:
                pokemon.apply_damage(damage)
                events.append(TurnEvent(turn, pokemon.species.name, "status", pokemon.species.name, damage, pokemon.status or ""))
            if pokemon.fainted:
                continue
            weather_damage = residual_weather_damage(pokemon, self.settings)
            if weather_damage:
                pokemon.apply_damage(weather_damage)
                events.append(
                    TurnEvent(turn, pokemon.species.name, "weather", pokemon.species.name, weather_damage, self.settings.weather)
                )
            if pokemon.fainted:
                continue
            terrain_heal = residual_terrain_healing(pokemon, self.settings)
            if terrain_heal:
                healed = pokemon.heal(terrain_heal)
                if healed:
                    events.append(TurnEvent(turn, pokemon.species.name, "terrain", pokemon.species.name, -healed, self.settings.terrain))
        return events


@dataclass
class TeamBattle:
    team1: list[PokemonState]
    team2: list[PokemonState]
    settings: BattleSettings = field(default_factory=BattleSettings)
    active1: int = 0
    active2: int = 0

    def run(self) -> BattleResult:
        rng = random.Random(self.settings.seed)
        events: list[TurnEvent] = []
        self.active1 = first_available_index(self.team1)
        self.active2 = first_available_index(self.team2)
        if self.active1 < 0 and self.active2 < 0:
            return BattleResult(BattleOutcome.DRAW, 0, None, None)
        if self.active1 < 0:
            return BattleResult(BattleOutcome.P2_WIN, 0, "team2", "team1")
        if self.active2 < 0:
            return BattleResult(BattleOutcome.P1_WIN, 0, "team1", "team2")
        self.settings, starting_events = apply_starting_abilities(self.p1, self.p2, self.settings)
        events.extend(starting_events)

        for turn in range(1, self.settings.max_turns + 1):
            self.p1.flinched = False
            self.p2.flinched = False
            p1_move = choose_move(self.p1, self.p2, turn, self.settings.move_strategy, rng, self.settings)
            p2_move = choose_move(self.p2, self.p1, turn, self.settings.move_strategy, rng, self.settings)
            for actor, defender, move in self._turn_order(rng, p1_move, p2_move):
                if actor.fainted or defender.fainted:
                    continue
                event = self._execute_move(turn, actor, defender, move, rng)
                events.append(event)
                if defender.fainted:
                    switched = self._switch_fainted(defender, turn)
                    events.extend(switched)
                    outcome = self._outcome_if_finished(turn, events)
                    if outcome is not None:
                        return outcome
            events.extend(self._apply_residual_status(turn))
            for fainted in (self.p1, self.p2):
                if fainted.fainted:
                    events.extend(self._switch_fainted(fainted, turn))
            outcome = self._outcome_if_finished(turn, events)
            if outcome is not None:
                return outcome
        return BattleResult(BattleOutcome.TURN_LIMIT, self.settings.max_turns, None, None, tuple(events))

    @property
    def p1(self) -> PokemonState:
        return self.team1[self.active1]

    @property
    def p2(self) -> PokemonState:
        return self.team2[self.active2]

    def _turn_order(
        self, rng: random.Random, p1_move: Move, p2_move: Move
    ) -> tuple[tuple[PokemonState, PokemonState, Move], tuple[PokemonState, PokemonState, Move]]:
        p1_key = (p1_move.priority, battle_stat(self.p1, "speed", self.settings), rng.random())
        p2_key = (p2_move.priority, battle_stat(self.p2, "speed", self.settings), rng.random())
        if p1_key >= p2_key:
            return ((self.p1, self.p2, p1_move), (self.p2, self.p1, p2_move))
        return ((self.p2, self.p1, p2_move), (self.p1, self.p2, p1_move))

    def _execute_move(self, turn: int, actor: PokemonState, defender: PokemonState, move: Move, rng: random.Random) -> TurnEvent:
        battle = Battle(actor, defender, self.settings)
        return battle._execute_move(turn, actor, defender, move, rng)

    def _apply_residual_status(self, turn: int) -> list[TurnEvent]:
        battle = Battle(self.p1, self.p2, self.settings)
        return battle._apply_residual_status(turn)

    def _switch_fainted(self, fainted: PokemonState, turn: int) -> list[TurnEvent]:
        events: list[TurnEvent] = []
        if fainted is self.p1:
            replacement = next_available_index(self.team1, self.active1 + 1)
            if replacement >= 0:
                self.active1 = replacement
                self.settings, ability_events = apply_starting_abilities(self.p1, self.p2, self.settings)
                events.append(TurnEvent(turn, "team1", "switch", self.p1.species.name, note=f"send {self.p1.species.name}"))
                events.extend(ability_events)
        elif fainted is self.p2:
            replacement = next_available_index(self.team2, self.active2 + 1)
            if replacement >= 0:
                self.active2 = replacement
                self.settings, ability_events = apply_starting_abilities(self.p1, self.p2, self.settings)
                events.append(TurnEvent(turn, "team2", "switch", self.p2.species.name, note=f"send {self.p2.species.name}"))
                events.extend(ability_events)
        return events

    def _outcome_if_finished(self, turn: int, events: list[TurnEvent]) -> BattleResult | None:
        team1_done = all(pokemon.fainted for pokemon in self.team1)
        team2_done = all(pokemon.fainted for pokemon in self.team2)
        if team1_done and team2_done:
            return BattleResult(BattleOutcome.DRAW, turn, None, None, tuple(events))
        if team2_done:
            return BattleResult(BattleOutcome.P1_WIN, turn, "team1", "team2", tuple(events))
        if team1_done:
            return BattleResult(BattleOutcome.P2_WIN, turn, "team2", "team1", tuple(events))
        return None


def calculate_damage(
    actor: PokemonState,
    defender: PokemonState,
    move: Move,
    settings: BattleSettings | None = None,
    rng: random.Random | None = None,
) -> tuple[int, list[str]]:
    settings = settings or BattleSettings(critical_hits=False)
    rng = rng or random.Random(settings.seed)
    attack_stat = "attack" if move.category == "physical" else "special_attack"
    defense_stat = "defense" if move.category == "physical" else "special_defense"
    attack = battle_stat(actor, attack_stat, settings)
    defense = battle_stat(defender, defense_stat, settings)
    if move.category == "physical" and defender.ability == "fur-coat":
        defense *= 2
    base = (((2 * actor.level / 5 + 2) * (move.power or 0) * attack / defense) / 50) + 2
    stab = stab_multiplier(actor, move)
    if actor.ability == "adaptability" and move.type in actor.offensive_types:
        stab = 2.0
    effectiveness = type_multiplier(move.type, defender.defensive_types)
    if defender.ability == "levitate" and move.type == "ground":
        effectiveness = 0.0
    modifier = stab * effectiveness
    notes = [f"x{effectiveness:g}"]
    environment = environment_multiplier(move, actor, defender, settings)
    if environment != 1.0:
        modifier *= environment
        notes.append(f"environment x{environment:g}")
    item = item_multiplier(move, actor)
    if item != 1.0:
        modifier *= item
        notes.append(f"item x{item:g}")
    ability = ability_multiplier(move, actor)
    if ability != 1.0:
        modifier *= ability
        notes.append(f"ability x{ability:g}")
    if settings.critical_hits and rng.random() < critical_hit_chance(actor):
        modifier *= 1.5
        notes.append("critical")
    return (max(1, int(base * modifier)) if effectiveness > 0 else 0, notes)


def apply_starting_abilities(
    p1: PokemonState,
    p2: PokemonState,
    settings: BattleSettings,
) -> tuple[BattleSettings, tuple[TurnEvent, ...]]:
    weather = settings.weather
    terrain = settings.terrain
    events: list[TurnEvent] = []
    for pokemon in (p1, p2):
        ability = pokemon.ability
        if ability in WEATHER_ABILITIES:
            new_weather = WEATHER_ABILITIES[ability]
            if weather != new_weather:
                weather = new_weather
                events.append(TurnEvent(0, pokemon.species.name, "ability", pokemon.species.name, note=f"{ability} weather {weather}"))
        if ability in TERRAIN_ABILITIES:
            new_terrain = TERRAIN_ABILITIES[ability]
            if terrain != new_terrain:
                terrain = new_terrain
                events.append(TurnEvent(0, pokemon.species.name, "ability", pokemon.species.name, note=f"{ability} terrain {terrain}"))
    return replace(settings, weather=weather, terrain=terrain), tuple(events)


WEATHER_ABILITIES: dict[str, WeatherName] = {
    "drought": "sun",
    "orichalcum-pulse": "sun",
    "drizzle": "rain",
    "sand-stream": "sandstorm",
    "snow-warning": "snow",
}


def battle_stat(pokemon: PokemonState, stat: str, settings: BattleSettings) -> int:
    value = pokemon.calculated_stat(stat)  # type: ignore[arg-type]
    ability = pokemon.ability
    if stat == "attack":
        if ability == "orichalcum-pulse" and settings.weather == "sun":
            value = value * 4 // 3
        if ability == "guts" and pokemon.status is not None:
            value = value * 3 // 2
    if stat == "special_attack":
        if ability == "hadron-engine" and settings.terrain == "electric":
            value = value * 4 // 3
        if ability == "solar-power" and settings.weather == "sun":
            value = value * 3 // 2
    if stat == "defense" and ability == "marvel-scale" and pokemon.status is not None:
        value = value * 3 // 2
    if stat == "speed":
        if ability == "chlorophyll" and settings.weather == "sun":
            value *= 2
        if ability == "swift-swim" and settings.weather == "rain":
            value *= 2
        if ability == "sand-rush" and settings.weather == "sandstorm":
            value *= 2
        if ability == "slush-rush" and settings.weather == "snow":
            value *= 2
    return max(1, value)


def stab_multiplier(actor: PokemonState, move: Move) -> float:
    if not actor.terastallized:
        return 1.5 if move.type in actor.species.types else 1.0
    if actor.tera_type == move.type and move.type in actor.species.types:
        return 2.0
    if actor.tera_type == move.type:
        return 1.5
    if move.type in actor.species.types:
        return 1.5
    return 1.0

TERRAIN_ABILITIES: dict[str, TerrainName] = {
    "electric-surge": "electric",
    "hadron-engine": "electric",
    "grassy-surge": "grassy",
    "misty-surge": "misty",
    "psychic-surge": "psychic",
}


def environment_multiplier(move: Move, actor: PokemonState, defender: PokemonState, settings: BattleSettings) -> float:
    multiplier = 1.0
    if settings.weather == "sun":
        if move.type == "fire":
            multiplier *= 1.5
        if move.type == "water":
            multiplier *= 0.5
    if settings.weather == "rain":
        if move.type == "water":
            multiplier *= 1.5
        if move.type == "fire":
            multiplier *= 0.5
    if settings.weather == "sandstorm" and move.type == "rock":
        multiplier *= 1.3
    if settings.weather == "snow" and move.type == "ice":
        multiplier *= 1.3
    if settings.terrain == "electric" and move.type == "electric" and is_grounded(actor):
        multiplier *= 1.3
    if settings.terrain == "grassy" and move.type == "grass" and is_grounded(actor):
        multiplier *= 1.3
    if settings.terrain == "psychic" and move.type == "psychic" and is_grounded(actor):
        multiplier *= 1.3
    if settings.terrain == "misty" and move.type == "dragon" and is_grounded(defender):
        multiplier *= 0.5
    return multiplier


def item_multiplier(move: Move, actor: PokemonState) -> float:
    item = actor.held_item
    if not item:
        return 1.0
    type_boosters = {
        "charcoal": "fire",
        "mystic-water": "water",
        "miracle-seed": "grass",
        "magnet": "electric",
        "black-belt": "fighting",
        "black-glasses": "dark",
        "spell-tag": "ghost",
        "dragon-fang": "dragon",
        "hard-stone": "rock",
        "soft-sand": "ground",
        "poison-barb": "poison",
        "sharp-beak": "flying",
        "twisted-spoon": "psychic",
        "silver-powder": "bug",
        "metal-coat": "steel",
        "never-melt-ice": "ice",
        "silk-scarf": "normal",
        "pixie-plate": "fairy",
    }
    if type_boosters.get(item) == move.type:
        return 1.2
    if item == "life-orb":
        return 1.3
    return 1.0


def ability_multiplier(move: Move, actor: PokemonState) -> float:
    ability = actor.ability
    if ability in {"blaze", "torrent", "overgrow", "swarm"}:
        ability_type = {"blaze": "fire", "torrent": "water", "overgrow": "grass", "swarm": "bug"}[ability]
        if move.type == ability_type and (actor.current_hp or 0) <= actor.max_hp // 3:
            return 1.5
    return 1.0


def apply_move_side_effects(actor: PokemonState, defender: PokemonState, move: Move, damage: int) -> list[str]:
    notes: list[str] = []
    if damage > 0 and move.drain:
        healed = actor.heal(max(1, damage * move.drain // 100))
        if healed:
            notes.append(f"{actor.species.name} drain {healed}")
    if move.healing:
        healed = actor.heal(max(1, actor.max_hp * move.healing // 100))
        if healed:
            notes.append(f"{actor.species.name} heal {healed}")
    if damage > 0 and move.recoil:
        recoil_damage = max(1, damage * move.recoil // 100)
        actor.apply_damage(recoil_damage)
        notes.append(f"{actor.species.name} recoil {recoil_damage}")
    if damage > 0 and actor.held_item == "life-orb":
        recoil_damage = max(1, actor.max_hp // 10)
        actor.apply_damage(recoil_damage)
        notes.append(f"{actor.species.name} life-orb {recoil_damage}")
    return notes


def critical_hit_chance(actor: PokemonState) -> float:
    if actor.ability == "super-luck":
        return 1 / 8
    if actor.held_item == "scope-lens":
        return 1 / 8
    return 1 / 24


def is_grounded(pokemon: PokemonState) -> bool:
    if "flying" in pokemon.defensive_types:
        return False
    if pokemon.ability == "levitate":
        return False
    return True


def modified_accuracy(move: Move, actor: PokemonState, defender: PokemonState) -> int | None:
    if move.accuracy is None:
        return None
    stage_delta = actor.stat_stages["accuracy"] - defender.stat_stages["evasion"]
    return max(1, min(100, int(move.accuracy * accuracy_multiplier(stage_delta))))


def accuracy_multiplier(stage: int) -> float:
    bounded = max(-6, min(6, stage))
    if bounded >= 0:
        return (3 + bounded) / 3
    return 3 / (3 - bounded)


def choose_move(
    actor: PokemonState,
    defender: PokemonState,
    turn: int,
    strategy: str = "best",
    rng: random.Random | None = None,
    settings: BattleSettings | None = None,
    forced_move: str | None = None,
) -> Move:
    available = [move for move in actor.species.moves if actor.move_pp.get(move.name, move.pp) > 0]
    if not available:
        return Move("struggle", "normal", "physical", 50, 100, pp=1)
    if strategy == "fixed":
        if forced_move is None:
            raise ValueError("fixed move strategy requires a forced move name")
        for move in available:
            if move.name == forced_move:
                return move
        raise ValueError(f"{actor.species.name} cannot use forced move {forced_move!r}")
    if strategy == "cycle":
        return available[(turn - 1) % len(available)]
    if strategy == "random":
        chooser = rng if rng is not None else random
        return chooser.choice(available)
    damaging = [move for move in available if move.category != "status" and move.power]
    if damaging:
        return max(
            damaging,
            key=lambda move: (
                projected_damage(actor, defender, move, settings),
                move.power or 0,
                move.name,
            ),
        )
    return available[(turn - 1) % len(available)]


def projected_damage(actor: PokemonState, defender: PokemonState, move: Move, settings: BattleSettings | None = None) -> int:
    if move.category == "status" or not move.power:
        return 0
    base_settings = settings or BattleSettings()
    projection_settings = BattleSettings(
        max_turns=base_settings.max_turns,
        seed=base_settings.seed,
        move_strategy=base_settings.move_strategy,
        weather=base_settings.weather,
        terrain=base_settings.terrain,
        p1_forced_move=base_settings.p1_forced_move,
        p2_forced_move=base_settings.p2_forced_move,
        critical_hits=False,
        verbose=base_settings.verbose,
    )
    damage, _ = calculate_damage(actor, defender, move, projection_settings, random.Random(projection_settings.seed))
    return damage


def residual_status_damage(pokemon: PokemonState) -> int:
    if pokemon.status in ("burn", "poison"):
        return max(1, pokemon.max_hp // 16)
    if pokemon.status == "badly_poisoned":
        pokemon.toxic_counter += 1
        return max(1, pokemon.max_hp * pokemon.toxic_counter // 16)
    return 0


def residual_weather_damage(pokemon: PokemonState, settings: BattleSettings) -> int:
    if settings.weather != "sandstorm":
        return 0
    if any(pokemon_type in {"rock", "ground", "steel"} for pokemon_type in pokemon.defensive_types):
        return 0
    if pokemon.ability in {"sand-force", "sand-rush", "sand-veil", "magic-guard", "overcoat"}:
        return 0
    return max(1, pokemon.max_hp // 16)


def residual_terrain_healing(pokemon: PokemonState, settings: BattleSettings) -> int:
    if settings.terrain != "grassy" or not is_grounded(pokemon):
        return 0
    return max(1, pokemon.max_hp // 16)


def can_apply_status(status: StatusName, target: PokemonState) -> bool:
    if target.status is not None:
        return False
    if status in ("poison", "badly_poisoned") and any(t in ("poison", "steel") for t in target.defensive_types):
        return False
    if status == "burn" and "fire" in target.defensive_types:
        return False
    if status == "paralysis" and "electric" in target.defensive_types:
        return False
    if status == "freeze" and "ice" in target.defensive_types:
        return False
    return True


def simulate_round_robin(
    roster: list,
    level: int = 50,
    max_turns: int = 200,
    move_strategy: str = "best",
    weather: WeatherName = "clear",
    terrain: TerrainName = "none",
    critical_hits: bool = True,
) -> dict[str, BattleResult]:
    results: dict[str, BattleResult] = {}
    for i, p1 in enumerate(roster):
        for j, p2 in enumerate(roster):
            if i == j:
                continue
            key = f"{p1.name}_vs_{p2.name}"
            battle = Battle(
                PokemonState(p1, level=level),
                PokemonState(p2, level=level),
                BattleSettings(
                    max_turns=max_turns,
                    seed=i * 10_000 + j,
                    move_strategy=move_strategy,
                    weather=weather,
                    terrain=terrain,
                    critical_hits=critical_hits,
                ),
            )
            results[key] = battle.run()
    return results


def first_available_index(team: list[PokemonState]) -> int:
    return next_available_index(team, 0)


def next_available_index(team: list[PokemonState], start: int) -> int:
    for index in range(start, len(team)):
        if not team[index].fainted:
            return index
    for index in range(0, start):
        if not team[index].fainted:
            return index
    return -1
