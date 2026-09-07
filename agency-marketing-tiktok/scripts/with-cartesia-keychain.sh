#!/bin/zsh

set -euo pipefail

if (( $# == 0 )); then
  print -u2 "Usage: scripts/with-cartesia-keychain.sh <command> [args...]"
  exit 64
fi

cartesia_account="$(/usr/bin/id -un)"
if ! cartesia_key="$(/usr/bin/security find-generic-password -a "$cartesia_account" -s creatorflow-cartesia -w 2>/dev/null)"; then
  print -u2 "Cartesia key is missing from macOS Keychain service: creatorflow-cartesia"
  exit 78
fi

export CARTESIA_API_KEY="$cartesia_key"
unset cartesia_key
exec "$@"
