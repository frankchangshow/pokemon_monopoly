from __future__ import annotations

from collections import defaultdict

from pokemon_engine.models import Evolution, PokemonSpecies


def evolution_edges(roster: list[PokemonSpecies]) -> list[Evolution]:
    return [edge for pokemon in roster for edge in pokemon.evolutions]


def evolution_graph(roster: list[PokemonSpecies]) -> dict[str, tuple[Evolution, ...]]:
    graph: dict[str, list[Evolution]] = defaultdict(list)
    for edge in evolution_edges(roster):
        graph[edge.from_species].append(edge)
    return {name: tuple(edges) for name, edges in graph.items()}


def evolution_paths(roster: list[PokemonSpecies]) -> dict[str, tuple[tuple[str, ...], ...]]:
    graph = evolution_graph(roster)
    species_names = {pokemon.name for pokemon in roster}
    roots = sorted(species_names - {edge.to_species for edge in evolution_edges(roster)})
    return {root: tuple(_walk_paths(root, graph, (root,))) for root in roots if root in graph}


def _walk_paths(
    current: str,
    graph: dict[str, tuple[Evolution, ...]],
    path: tuple[str, ...],
) -> list[tuple[str, ...]]:
    edges = graph.get(current, ())
    if not edges:
        return [path]
    paths: list[tuple[str, ...]] = []
    for edge in edges:
        if edge.to_species in path:
            raise ValueError(f"Evolution cycle detected: {' -> '.join(path + (edge.to_species,))}")
        paths.extend(_walk_paths(edge.to_species, graph, path + (edge.to_species,)))
    return paths


def validate_evolution_graph(roster: list[PokemonSpecies], strict_sources: bool = True) -> list[str]:
    errors: list[str] = []
    names = {pokemon.name for pokemon in roster}
    for edge in evolution_edges(roster):
        if strict_sources and edge.from_species not in names:
            errors.append(f"missing source species: {edge.from_species}")
        if not edge.to_species:
            errors.append(f"missing target species for {edge.from_species}")
    try:
        evolution_paths(roster)
    except ValueError as exc:
        errors.append(str(exc))
    return errors
