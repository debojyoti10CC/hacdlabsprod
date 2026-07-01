#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_launch_spec.py -- FORGE launch spec validator
Usage: python3 scripts/validate_launch_spec.py project_frg/launch_spec.json [--strict]
Expected output: 0 errors, 2 warnings (issuer_confirmed + hacd_labs_reviewed in draft)
"""

import sys
import io
import json
import argparse
from pathlib import Path

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


REQUIRED_FIELDS = [
    ("project.name", str),
    ("project.ticker", str),
    ("project.category", str),
    ("project.description", str),
    ("issuance.asset_type", str),
    ("issuance.total_supply", int),
    ("issuance.hacd_lots", int),
    ("issuance.units_per_hacd_lot", int),
    ("issuance.stack_cost_per_hacd_hac", (int, float)),
    ("utility.holder_rights", str),
    ("utility.product_utility", str),
    ("compliance.not_financial_advice", bool),
    ("compliance.human_review_required", bool),
    ("compliance.issuer_confirmed", bool),
    ("compliance.hacd_labs_reviewed", bool),
    ("compliance.risk_disclosure_included", bool),
]

HACD_CHARSET = set("WTYUIAHXVMEKBSZN")

BANNED_TERMS = [
    "guaranteed profit", "price floor", "investment return",
    "risk-free", "moon", "yield", "profit guarantee",
    "nft", "just minting",
]


def get_nested(d, key_path):
    """Get nested dict value by dot-separated key path."""
    keys = key_path.split(".")
    current = d
    for k in keys:
        if not isinstance(current, dict) or k not in current:
            return None
        current = current[k]
    return current


def validate(spec_path: Path, strict: bool = False):
    errors = []
    warnings = []

    # Load JSON
    try:
        with open(spec_path, encoding="utf-8") as f:
            spec = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"FATAL: Could not load {spec_path}: {e}")
        sys.exit(1)

    # Check required fields
    for field_path, expected_type in REQUIRED_FIELDS:
        value = get_nested(spec, field_path)
        if value is None:
            errors.append(f"Missing required field: {field_path}")
        elif not isinstance(value, expected_type):
            errors.append(
                f"Wrong type for {field_path}: expected {expected_type.__name__ if not isinstance(expected_type, tuple) else str(expected_type)}, got {type(value).__name__}"
            )

    # Supply math check
    hacd_lots = get_nested(spec, "issuance.hacd_lots")
    units_per_lot = get_nested(spec, "issuance.units_per_hacd_lot")
    total_supply = get_nested(spec, "issuance.total_supply")

    if all(isinstance(x, (int, float)) for x in [hacd_lots, units_per_lot, total_supply]):
        expected = hacd_lots * units_per_lot
        if expected != total_supply:
            errors.append(
                f"Supply mismatch: hacd_lots ({hacd_lots}) × units_per_hacd_lot ({units_per_lot}) = {expected}, "
                f"but total_supply = {total_supply}"
            )

    # Compliance warnings (draft flags)
    issuer_confirmed = get_nested(spec, "compliance.issuer_confirmed")
    hacd_labs_reviewed = get_nested(spec, "compliance.hacd_labs_reviewed")

    if issuer_confirmed is False:
        warnings.append("compliance.issuer_confirmed = false — issuer must confirm parameters before publication")
    if hacd_labs_reviewed is False:
        warnings.append("compliance.hacd_labs_reviewed = false — HACD Labs must review before publication")

    # Banned terms check in string values (recursive)
    def check_banned(obj, path=""):
        if isinstance(obj, str):
            lower = obj.lower()
            for term in BANNED_TERMS:
                if term in lower:
                    errors.append(f"Banned term '{term}' found in field '{path}'")
        elif isinstance(obj, dict):
            for k, v in obj.items():
                check_banned(v, f"{path}.{k}" if path else k)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                check_banned(v, f"{path}[{i}]")

    check_banned(spec)

    # Print results
    print(f"\n{'='*60}")
    print(f"  FORGE launch_spec.json validator")
    print(f"  File: {spec_path}")
    print(f"{'='*60}\n")

    if errors:
        print(f"ERRORS ({len(errors)}):")
        for e in errors:
            print(f"  [X] {e}")
    else:
        print("ERRORS: 0 [OK]")

    print()

    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  [!] {w}")
    else:
        print("WARNINGS: 0")

    print()
    print(f"Result: {len(errors)} error(s), {len(warnings)} warning(s)")

    if strict and len(errors) > 0:
        print("\nFAILED (--strict mode, errors present)")
        sys.exit(1)
    elif len(errors) > 0:
        sys.exit(1)
    else:
        print("\nPASSED")
        print("Expected: 0 errors, 2 warnings (issuer_confirmed + hacd_labs_reviewed = false in draft)")
        sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate a FORGE launch_spec.json file")
    parser.add_argument("spec_path", type=Path, help="Path to launch_spec.json")
    parser.add_argument("--strict", action="store_true", help="Exit with code 1 on any errors")
    args = parser.parse_args()
    validate(args.spec_path, args.strict)
