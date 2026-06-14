from __future__ import annotations

TYPES = (
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy",
)

SUPER_EFFECTIVE = {
    "normal": (),
    "fire": ("grass", "ice", "bug", "steel"),
    "water": ("fire", "ground", "rock"),
    "electric": ("water", "flying"),
    "grass": ("water", "ground", "rock"),
    "ice": ("grass", "ground", "flying", "dragon"),
    "fighting": ("normal", "ice", "rock", "dark", "steel"),
    "poison": ("grass", "fairy"),
    "ground": ("fire", "electric", "poison", "rock", "steel"),
    "flying": ("grass", "fighting", "bug"),
    "psychic": ("fighting", "poison"),
    "bug": ("grass", "psychic", "dark"),
    "rock": ("fire", "ice", "flying", "bug"),
    "ghost": ("psychic", "ghost"),
    "dragon": ("dragon",),
    "dark": ("psychic", "ghost"),
    "steel": ("ice", "rock", "fairy"),
    "fairy": ("fighting", "dragon", "dark"),
}

NOT_VERY_EFFECTIVE = {
    "normal": ("rock", "steel"),
    "fire": ("fire", "water", "rock", "dragon"),
    "water": ("water", "grass", "dragon"),
    "electric": ("electric", "grass", "dragon"),
    "grass": ("fire", "grass", "poison", "flying", "bug", "dragon", "steel"),
    "ice": ("fire", "water", "ice", "steel"),
    "fighting": ("poison", "flying", "psychic", "bug", "fairy"),
    "poison": ("poison", "ground", "rock", "ghost"),
    "ground": ("grass", "bug"),
    "flying": ("electric", "rock", "steel"),
    "psychic": ("psychic", "steel"),
    "bug": ("fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"),
    "rock": ("fighting", "ground", "steel"),
    "ghost": ("dark",),
    "dragon": ("steel",),
    "dark": ("fighting", "dark", "fairy"),
    "steel": ("fire", "water", "electric", "steel"),
    "fairy": ("fire", "poison", "steel"),
}

IMMUNE = {
    "normal": ("ghost",),
    "electric": ("ground",),
    "fighting": ("ghost",),
    "poison": ("steel",),
    "ground": ("flying",),
    "psychic": ("dark",),
    "ghost": ("normal",),
    "dragon": ("fairy",),
}


def type_multiplier(attack_type: str, defender_types: tuple[str, ...]) -> float:
    multiplier = 1.0
    for defender_type in defender_types:
        if defender_type in IMMUNE.get(attack_type, ()):
            return 0.0
        if defender_type in SUPER_EFFECTIVE.get(attack_type, ()):
            multiplier *= 2.0
        if defender_type in NOT_VERY_EFFECTIVE.get(attack_type, ()):
            multiplier *= 0.5
    return multiplier
