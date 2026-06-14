from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pokemon_engine.models import Evolution, Move, PokemonSpecies, StatChange, StatusEffect


def load_roster(path: str | Path = "data/paldea_fixture.json") -> list[PokemonSpecies]:
    raw = json.loads(Path(path).read_text())
    return [species_from_dict(item) for item in raw["pokemon"]]


def species_from_dict(item: dict[str, Any]) -> PokemonSpecies:
    return PokemonSpecies(
        id=item["id"],
        name=item["name"],
        types=tuple(item["types"]),
        base_stats=item["base_stats"],
        moves=tuple(move_from_dict(move) for move in item["moves"]),
        abilities=tuple(item.get("abilities", ())),
        evolutions=tuple(evolution_from_dict(evo) for evo in item.get("evolutions", [])),
    )


def move_from_dict(item: dict[str, Any]) -> Move:
    return Move(
        name=item["name"],
        type=item["type"],
        category=item["category"],
        power=item.get("power"),
        accuracy=item.get("accuracy", 100),
        pp=item.get("pp", 10),
        priority=item.get("priority", 0),
        drain=item.get("drain", 0),
        healing=item.get("healing", 0),
        recoil=item.get("recoil", 0),
        flinch_chance=item.get("flinch_chance", 0.0),
        confusion_chance=item.get("confusion_chance", 0.0),
        stat_changes=tuple(StatChange(**change) for change in item.get("stat_changes", [])),
        status_effects=tuple(StatusEffect(**effect) for effect in item.get("status_effects", [])),
    )


def evolution_from_dict(item: dict[str, Any]) -> Evolution:
    return Evolution(
        from_species=item["from_species"],
        to_species=item["to_species"],
        trigger=item["trigger"],
        minimum_level=item.get("minimum_level"),
        item=item.get("item"),
        condition=item.get("condition"),
    )
