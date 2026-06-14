import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class ScriptTests(unittest.TestCase):
    def test_round_robin_script_writes_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "report.json"
            completed = subprocess.run(
                [
                    sys.executable,
                    "scripts/run_round_robin.py",
                    "--output",
                    str(output),
                    "--max-turns",
                    "100",
                    "--move-strategy",
                    "cycle",
                    "--weather",
                    "sun",
                    "--terrain",
                    "grassy",
                    "--no-critical-hits",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("Simulated", completed.stdout)
            report = json.loads(output.read_text())
            self.assertEqual(report["ordered_battle_count"], report["pokemon_count"] * (report["pokemon_count"] - 1))
            self.assertEqual(report["move_strategy"], "cycle")
            self.assertEqual(report["weather"], "sun")
            self.assertEqual(report["terrain"], "grassy")
            self.assertFalse(report["critical_hits"])

    def test_generated_paldea_report_when_present(self) -> None:
        path = Path("reports/paldea_round_robin.json")
        if not path.exists():
            self.skipTest("Generated full Paldea round-robin report is not present.")
        report = json.loads(path.read_text())
        self.assertEqual(report["pokemon_count"], 400)
        self.assertEqual(report["ordered_battle_count"], 159600)
        self.assertEqual(len(report["results"]), 159600)
        self.assertIn(report["weather"], {"clear", "sun", "rain", "sandstorm", "snow"})
        self.assertIn(report["terrain"], {"none", "electric", "grassy", "misty", "psychic"})

    def test_move_permutation_script_writes_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "permutations.json"
            completed = subprocess.run(
                [
                    sys.executable,
                    "scripts/verify_move_permutations.py",
                    "--output",
                    str(output),
                    "--max-turns",
                    "1",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("Verified", completed.stdout)
            report = json.loads(output.read_text())
            self.assertEqual(report["pokemon_count"], 12)
            self.assertEqual(report["failure_count"], 0)
            self.assertEqual(report["evolution_error_count"], 0)
            self.assertGreater(report["move_pair_permutations"], report["ordered_matchups"])

    def test_generated_paldea_move_permutation_report_when_present(self) -> None:
        path = Path("reports/paldea_move_permutations.json")
        if not path.exists():
            self.skipTest("Generated full Paldea move permutation report is not present.")
        report = json.loads(path.read_text())
        self.assertEqual(report["pokemon_count"], 400)
        self.assertEqual(report["ordered_matchups"], 159600)
        self.assertGreater(report["move_pair_permutations"], 2_500_000)
        self.assertEqual(report["failure_count"], 0)
        self.assertEqual(report["evolution_error_count"], 0)

    def test_tera_matrix_script_writes_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "tera.json"
            completed = subprocess.run(
                [
                    sys.executable,
                    "scripts/verify_tera_matrix.py",
                    "--data",
                    "data/paldea_fixture.json",
                    "--output",
                    str(output),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            self.assertIn("Verified", completed.stdout)
            report = json.loads(output.read_text())
            self.assertEqual(report["pokemon_count"], 12)
            self.assertEqual(report["matrix_entries"], 12 * 18 * 18)
            self.assertEqual(report["failure_count"], 0)

    def test_generated_paldea_tera_matrix_report_when_present(self) -> None:
        path = Path("reports/paldea_tera_matrix.json")
        if not path.exists():
            self.skipTest("Generated full Paldea Tera matrix report is not present.")
        report = json.loads(path.read_text())
        self.assertEqual(report["pokemon_count"], 400)
        self.assertEqual(report["matrix_entries"], 400 * 18 * 18)
        self.assertEqual(report["failure_count"], 0)


if __name__ == "__main__":
    unittest.main()
