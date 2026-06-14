#!/usr/bin/env python3
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import sys
import threading
import time
from typing import Any
from urllib.parse import quote
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


API = "https://pokeapi.co/api/v2"
HTTP_CACHE_DIR = Path(".cache/pokeapi")
MEMORY_CACHE: dict[str, dict[str, Any]] = {}
FETCH_LOCK = threading.Lock()
STAT_MAP = {
    "hp": "hp",
    "attack": "attack",
    "defense": "defense",
    "special-attack": "special_attack",
    "special-defense": "special_defense",
    "speed": "speed",
}


def fetch_json(url: str) -> dict[str, Any]:
    cache_path = HTTP_CACHE_DIR / f"{quote(url, safe='')}.json"
    with FETCH_LOCK:
        if url in MEMORY_CACHE:
            return MEMORY_CACHE[url]
        if cache_path.exists():
            data = json.loads(cache_path.read_text())
            MEMORY_CACHE[url] = data
            return data
    request = Request(url, headers={"User-Agent": "PokemonBattleEngine/0.1 (data sync)"})
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urlopen(request, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
                with FETCH_LOCK:
                    cache_path.parent.mkdir(parents=True, exist_ok=True)
                    cache_path.write_text(json.dumps(data))
                    MEMORY_CACHE[url] = data
                return data
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            if isinstance(exc, HTTPError) and exc.code in {400, 401, 403, 404}:
                break
            time.sleep(0.5 * (attempt + 1))
    raise RuntimeError(f"Could not fetch {url}: {last_error}") from last_error


def api(path: str) -> dict[str, Any]:
    return fetch_json(f"{API}/{path.lstrip('/')}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Paldea or Generation IX Pokemon data from PokeAPI.")
    parser.add_argument(
        "--source",
        choices=("paldea-pokedex", "generation-9"),
        default="paldea-pokedex",
        help="paldea-pokedex fetches the regional Paldea dex; generation-9 fetches species introduced in Gen IX.",
    )
    parser.add_argument("--output", default="data/paldea_pokeapi.json", help="Output JSON path.")
    parser.add_argument("--limit-moves", type=int, default=8, help="Maximum usable moves to retain per Pokemon.")
    parser.add_argument("--cache-dir", default=".cache/pokeapi", help="HTTP cache directory for PokeAPI responses.")
    parser.add_argument("--workers", type=int, default=8, help="Concurrent species workers.")
    args = parser.parse_args()

    global HTTP_CACHE_DIR
    HTTP_CACHE_DIR = Path(args.cache_dir)

    species_refs = load_species_refs(args.source)
    pokemon_by_index: dict[int, dict[str, Any]] = {}

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = {
            executor.submit(fetch_species_payload, ref, args.limit_moves): (index, ref["name"])
            for index, ref in enumerate(species_refs, start=1)
        }
        completed = 0
        for future in as_completed(futures):
            index, name = futures[future]
            pokemon_by_index[index] = future.result()
            completed += 1
            print(f"[{completed}/{len(species_refs)}] {name}", flush=True)

    pokemon = [pokemon_by_index[index] for index in sorted(pokemon_by_index)]

    output = {
        "metadata": {
            "source": f"https://pokeapi.co/api/v2/{'pokedex/paldea' if args.source == 'paldea-pokedex' else 'generation/9'}",
            "scope": (
                "Paldea regional pokedex entries from PokeAPI."
                if args.source == "paldea-pokedex"
                else "Generation IX Pokemon species from PokeAPI. This is not the full in-game Paldea regional dex."
            ),
            "pokemon_count": len(pokemon),
            "official_stat_names": list(STAT_MAP.values()),
        },
        "pokemon": pokemon,
    }
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(output, indent=2, sort_keys=True) + "\n")
    print(f"Wrote {len(pokemon)} Pokemon to {path}")


def load_species_refs(source: str) -> list[dict[str, str]]:
    if source == "generation-9":
        generation = api("generation/9")
        return sorted(generation["pokemon_species"], key=lambda item: item["name"])
    pokedex = api("pokedex/paldea")
    refs = []
    seen = set()
    for entry in sorted(pokedex["pokemon_entries"], key=lambda item: item["entry_number"]):
        species = entry["pokemon_species"]
        if species["name"] in seen:
            continue
        seen.add(species["name"])
        refs.append(species)
    return refs


def fetch_species_payload(ref: dict[str, str], limit_moves: int) -> dict[str, Any]:
    species = fetch_json(ref["url"])
    variety = select_variety(species)
    details = fetch_json(variety["pokemon"]["url"])
    selected_name = details["name"]
    return {
        "id": details["id"],
        "name": details["name"],
        "types": [slot["type"]["name"] for slot in sorted(details["types"], key=lambda item: item["slot"])],
        "abilities": [
            ability["ability"]["name"]
            for ability in sorted(details["abilities"], key=lambda item: (item["is_hidden"], item["slot"]))
        ],
        "base_stats": {
            STAT_MAP[entry["stat"]["name"]]: entry["base_stat"]
            for entry in details["stats"]
            if entry["stat"]["name"] in STAT_MAP
        },
        "moves": extract_moves(details, limit_moves),
        "evolutions": extract_evolutions(species, selected_name),
    }


def select_variety(species: dict[str, Any]) -> dict[str, Any]:
    paldea_variety = next((item for item in species["varieties"] if "-paldea" in item["pokemon"]["name"]), None)
    if paldea_variety is not None:
        return paldea_variety
    return next((item for item in species["varieties"] if item["is_default"]), species["varieties"][0])


def extract_moves(details: dict[str, Any], limit: int) -> list[dict[str, Any]]:
    candidates: list[tuple[tuple[int, int, int, int, int, int, str], dict[str, Any]]] = []
    pokemon_types = {slot["type"]["name"] for slot in details["types"]}
    for ref in details["moves"]:
        version_details = [
            item
            for item in ref["version_group_details"]
            if item["version_group"]["name"] in {"scarlet-violet", "the-indigo-disk", "the-teal-mask"}
        ]
        if not version_details:
            continue
        move = fetch_json(ref["move"]["url"])
        if move["damage_class"]["name"] not in {"physical", "special", "status"}:
            continue
        payload = move_payload(move)
        candidates.append((move_score(move, version_details, pokemon_types, payload), payload))
    moves = select_diverse_moves(candidates, limit)
    if not moves:
        moves.append({"name": "struggle", "type": "normal", "category": "physical", "power": 50, "accuracy": 100, "pp": 1})
    return moves


def move_payload(move: dict[str, Any]) -> dict[str, Any]:
    meta = move.get("meta") or {}
    return {
        "name": move["name"],
        "type": move["type"]["name"],
        "category": move["damage_class"]["name"],
        "power": move["power"],
        "accuracy": move["accuracy"],
        "pp": move["pp"],
        "priority": move["priority"],
        "drain": meta.get("drain") or 0,
        "healing": meta.get("healing") or 0,
        "recoil": meta.get("recoil") or 0,
        "flinch_chance": chance_from_optional_percent(meta.get("flinch_chance")),
        "confusion_chance": chance_from_optional_percent(meta.get("confusion_chance")),
        "stat_changes": extract_stat_changes(move),
        "status_effects": extract_status_effects(move),
    }


def move_score(
    move: dict[str, Any],
    version_details: list[dict[str, Any]],
    pokemon_types: set[str],
    payload: dict[str, Any],
) -> tuple[int, int, int, int, int, int, str]:
    best_detail = max(version_details, key=learn_detail_score)
    method = best_detail["move_learn_method"]["name"]
    learned_level = best_detail.get("level_learned_at") or 0
    method_score = {"level-up": 4, "machine": 3, "tutor": 2, "egg": 1}.get(method, 0)
    category_score = {"physical": 3, "special": 3, "status": 2}.get(payload["category"], 0)
    effect_score = 2 if has_secondary_effect(payload) else 0
    stab_score = 2 if payload["type"] in pokemon_types else 0
    power = payload["power"] or 0
    accuracy = payload["accuracy"] if payload["accuracy"] is not None else 100
    return (method_score, stab_score, category_score, effect_score, power, accuracy + learned_level, payload["name"])


def has_secondary_effect(payload: dict[str, Any]) -> bool:
    return bool(
        payload["stat_changes"]
        or payload["status_effects"]
        or payload["drain"]
        or payload["healing"]
        or payload["recoil"]
        or payload["flinch_chance"]
        or payload["confusion_chance"]
    )


def learn_detail_score(detail: dict[str, Any]) -> tuple[int, int]:
    method = detail["move_learn_method"]["name"]
    method_score = {"level-up": 4, "machine": 3, "tutor": 2, "egg": 1}.get(method, 0)
    return (method_score, detail.get("level_learned_at") or 0)


def select_diverse_moves(
    candidates: list[tuple[tuple[int, int, int, int, int, int, str], dict[str, Any]]],
    limit: int,
) -> list[dict[str, Any]]:
    selected: list[dict[str, Any]] = []
    seen_names: set[str] = set()
    sorted_candidates = sorted(candidates, key=lambda item: item[0], reverse=True)
    preferred_categories = ("physical", "special", "status")
    for category in preferred_categories:
        for _, move in sorted_candidates:
            if move["category"] == category and move["name"] not in seen_names:
                selected.append(move)
                seen_names.add(move["name"])
                break
        if len(selected) >= limit:
            return selected
    for _, move in sorted_candidates:
        if move["name"] in seen_names:
            continue
        selected.append(move)
        seen_names.add(move["name"])
        if len(selected) >= limit:
            break
    return selected


def extract_stat_changes(move: dict[str, Any]) -> list[dict[str, Any]]:
    target = target_from_move(move)
    chance = chance_from_percent(move.get("effect_chance"))
    changes = []
    for change in move["stat_changes"]:
        stat = STAT_MAP.get(change["stat"]["name"], change["stat"]["name"].replace("-", "_"))
        if stat not in {"attack", "defense", "special_attack", "special_defense", "speed", "accuracy", "evasion"}:
            continue
        changes.append({"target": target, "stat": stat, "stages": change["change"], "chance": chance})
    return changes


def extract_status_effects(move: dict[str, Any]) -> list[dict[str, Any]]:
    meta = move.get("meta") or {}
    ailment = (meta.get("ailment") or {}).get("name")
    status = {
        "burn": "burn",
        "paralysis": "paralysis",
        "poison": "poison",
        "badly-poisoned": "badly_poisoned",
        "sleep": "sleep",
        "freeze": "freeze",
    }.get(ailment)
    if not status:
        return []
    chance = chance_from_percent(meta.get("ailment_chance") or move.get("effect_chance"))
    return [{"target": target_from_move(move), "status": status, "chance": chance}]


def target_from_move(move: dict[str, Any]) -> str:
    target = move["target"]["name"]
    return "self" if target in {"user", "users-field", "user-or-ally"} else "opponent"


def chance_from_percent(percent: int | None) -> float:
    if percent is None or percent <= 0:
        return 1.0
    return min(1.0, max(0.0, percent / 100))


def chance_from_optional_percent(percent: int | None) -> float:
    if percent is None or percent <= 0:
        return 0.0
    return min(1.0, max(0.0, percent / 100))


def extract_evolutions(species: dict[str, Any], selected_name: str | None = None) -> list[dict[str, Any]]:
    chain_url = species["evolution_chain"]["url"]
    chain = fetch_json(chain_url)["chain"]
    evolutions: list[dict[str, Any]] = []
    walk_chain(chain, evolutions, selected_name or species["name"])
    return evolutions


def walk_chain(node: dict[str, Any], evolutions: list[dict[str, Any]], selected_name: str) -> None:
    from_name = node["species"]["name"]
    for child in node["evolves_to"]:
        detail = child["evolution_details"][0] if child["evolution_details"] else {}
        base_form = detail_name(detail, "base_form")
        if selected_name != from_name and from_name == selected_name.split("-")[0] and base_form != selected_name:
            walk_chain(child, evolutions, selected_name)
            continue
        edge_from = base_form if base_form else from_name
        evolutions.append(
            {
                "from_species": edge_from,
                "to_species": child["species"]["name"],
                "trigger": detail.get("trigger", {}).get("name", "unknown"),
                "minimum_level": detail.get("min_level"),
                "item": detail.get("item", {}).get("name") if detail.get("item") else None,
                "condition": condition_from_detail(detail),
            }
        )
        walk_chain(child, evolutions, selected_name)


def detail_name(detail: dict[str, Any], key: str) -> str | None:
    value = detail.get(key)
    if isinstance(value, dict):
        return value.get("name")
    return None


def condition_from_detail(detail: dict[str, Any]) -> str | None:
    ignored = {"trigger", "min_level", "item"}
    parts = []
    for key, value in detail.items():
        if key in ignored or value in (None, False, "", []):
            continue
        if isinstance(value, dict) and "name" in value:
            parts.append(f"{key}={value['name']}")
        else:
            parts.append(f"{key}={value}")
    return ", ".join(parts) if parts else None


if __name__ == "__main__":
    main()
