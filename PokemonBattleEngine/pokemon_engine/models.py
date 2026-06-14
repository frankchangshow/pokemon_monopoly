from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Literal


StatName = Literal["hp", "attack", "defense", "special_attack", "special_defense", "speed"]
BattleStatName = Literal["attack", "defense", "special_attack", "special_defense", "speed", "accuracy", "evasion"]
MoveCategory = Literal["physical", "special", "status"]
StatusName = Literal["burn", "paralysis", "poison", "badly_poisoned", "sleep", "freeze"]
WeatherName = Literal["clear", "sun", "rain", "sandstorm", "snow"]
TerrainName = Literal["none", "electric", "grassy", "misty", "psychic"]

ALL_STATS: tuple[StatName, ...] = ("hp", "attack", "defense", "special_attack", "special_defense", "speed")
NEUTRAL_NATURES = {"bashful", "docile", "hardy", "quirky", "serious"}
NATURE_MODIFIERS: dict[str, tuple[StatName, StatName]] = {
    "lonely": ("attack", "defense"),
    "brave": ("attack", "speed"),
    "adamant": ("attack", "special_attack"),
    "naughty": ("attack", "special_defense"),
    "bold": ("defense", "attack"),
    "relaxed": ("defense", "speed"),
    "impish": ("defense", "special_attack"),
    "lax": ("defense", "special_defense"),
    "timid": ("speed", "attack"),
    "hasty": ("speed", "defense"),
    "jolly": ("speed", "special_attack"),
    "naive": ("speed", "special_defense"),
    "modest": ("special_attack", "attack"),
    "mild": ("special_attack", "defense"),
    "quiet": ("special_attack", "speed"),
    "rash": ("special_attack", "special_defense"),
    "calm": ("special_defense", "attack"),
    "gentle": ("special_defense", "defense"),
    "sassy": ("special_defense", "speed"),
    "careful": ("special_defense", "special_attack"),
}


class BattleOutcome(str, Enum):
    P1_WIN = "p1_win"
    P2_WIN = "p2_win"
    DRAW = "draw"
    TURN_LIMIT = "turn_limit"


@dataclass(frozen=True)
class StatChange:
    target: Literal["self", "opponent"]
    stat: BattleStatName
    stages: int
    chance: float = 1.0


@dataclass(frozen=True)
class StatusEffect:
    target: Literal["self", "opponent"]
    status: StatusName
    chance: float = 1.0


@dataclass(frozen=True)
class Move:
    name: str
    type: str
    category: MoveCategory
    power: int | None
    accuracy: int | None = 100
    pp: int = 10
    priority: int = 0
    drain: int = 0
    healing: int = 0
    recoil: int = 0
    flinch_chance: float = 0.0
    confusion_chance: float = 0.0
    stat_changes: tuple[StatChange, ...] = ()
    status_effects: tuple[StatusEffect, ...] = ()


@dataclass(frozen=True)
class Evolution:
    from_species: str
    to_species: str
    trigger: str
    minimum_level: int | None = None
    item: str | None = None
    condition: str | None = None


@dataclass(frozen=True)
class PokemonSpecies:
    id: int
    name: str
    types: tuple[str, ...]
    base_stats: dict[StatName, int]
    moves: tuple[Move, ...]
    abilities: tuple[str, ...] = ()
    evolutions: tuple[Evolution, ...] = ()


@dataclass
class PokemonState:
    species: PokemonSpecies
    level: int = 50
    ability: str | None = None
    held_item: str | None = None
    tera_type: str | None = None
    terastallized: bool = False
    ivs: dict[StatName, int] = field(default_factory=dict)
    evs: dict[StatName, int] = field(default_factory=dict)
    nature: str = "hardy"
    current_hp: int | None = None
    status: StatusName | None = None
    stat_stages: dict[BattleStatName, int] = field(default_factory=dict)
    move_pp: dict[str, int] = field(default_factory=dict)
    toxic_counter: int = 0
    sleep_turns: int = 0
    flinched: bool = False
    confused_turns: int = 0

    def __post_init__(self) -> None:
        self.level = max(1, min(100, self.level))
        self.ivs = normalize_ivs(self.ivs)
        self.evs = normalize_evs(self.evs)
        self.nature = self.nature.lower()
        if self.tera_type is None:
            self.tera_type = self.species.types[0]
        if self.current_hp is None:
            self.current_hp = self.max_hp
        if self.ability is None and self.species.abilities:
            self.ability = self.species.abilities[0]
        for stat in ("attack", "defense", "special_attack", "special_defense", "speed", "accuracy", "evasion"):
            self.stat_stages.setdefault(stat, 0)
        for move in self.species.moves:
            self.move_pp.setdefault(move.name, move.pp)

    @property
    def max_hp(self) -> int:
        base = self.species.base_stats["hp"]
        return (((2 * base + self.ivs["hp"] + self.evs["hp"] // 4) * self.level) // 100) + self.level + 10

    def calculated_stat(self, stat: StatName) -> int:
        if stat == "hp":
            return self.max_hp
        base = self.species.base_stats[stat]
        value = (((2 * base + self.ivs[stat] + self.evs[stat] // 4) * self.level) // 100) + 5
        value = int(value * nature_multiplier(self.nature, stat))
        stage_stat = stat if stat in self.stat_stages else None
        if stage_stat:
            value = int(value * stage_multiplier(self.stat_stages[stage_stat]))
        if stat == "attack" and self.status == "burn":
            value = max(1, value // 2)
        if stat == "speed" and self.status == "paralysis":
            value = max(1, value // 2)
        return max(1, value)

    @property
    def defensive_types(self) -> tuple[str, ...]:
        if self.terastallized and self.tera_type:
            return (self.tera_type,)
        return self.species.types

    @property
    def offensive_types(self) -> tuple[str, ...]:
        if self.terastallized and self.tera_type:
            return tuple(dict.fromkeys((*self.species.types, self.tera_type)))
        return self.species.types

    @property
    def fainted(self) -> bool:
        return self.current_hp is not None and self.current_hp <= 0

    def apply_damage(self, amount: int) -> int:
        damage = max(0, amount)
        self.current_hp = max(0, (self.current_hp or 0) - damage)
        return damage

    def heal(self, amount: int) -> int:
        if self.current_hp is None:
            self.current_hp = self.max_hp
        before = self.current_hp
        self.current_hp = min(self.max_hp, self.current_hp + max(0, amount))
        return self.current_hp - before

    def heal_full(self) -> None:
        self.current_hp = self.max_hp
        self.status = None
        self.toxic_counter = 0
        self.sleep_turns = 0
        self.flinched = False
        self.confused_turns = 0
        for key in self.stat_stages:
            self.stat_stages[key] = 0
        for move in self.species.moves:
            self.move_pp[move.name] = move.pp


def stage_multiplier(stage: int) -> float:
    bounded = max(-6, min(6, stage))
    if bounded >= 0:
        return (2 + bounded) / 2
    return 2 / (2 - bounded)


def normalize_ivs(values: dict[StatName, int]) -> dict[StatName, int]:
    return {stat: max(0, min(31, int(values.get(stat, 31)))) for stat in ALL_STATS}


def normalize_evs(values: dict[StatName, int]) -> dict[StatName, int]:
    capped = {stat: max(0, min(252, int(values.get(stat, 0)))) for stat in ALL_STATS}
    total = sum(capped.values())
    if total <= 510:
        return capped
    remaining = 510
    normalized: dict[StatName, int] = {}
    for stat in ALL_STATS:
        value = min(capped[stat], remaining)
        normalized[stat] = value
        remaining -= value
    return normalized


def nature_multiplier(nature: str, stat: StatName) -> float:
    normalized = nature.lower()
    if normalized in NEUTRAL_NATURES or stat == "hp":
        return 1.0
    increased, decreased = NATURE_MODIFIERS.get(normalized, ("hp", "hp"))
    if stat == increased:
        return 1.1
    if stat == decreased:
        return 0.9
    return 1.0
