#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

die() {
  printf "Error: %s\n" "$1" >&2
  exit 1
}

confirm() {
  local prompt="$1"
  local default="${2:-n}"
  local answer
  local suffix

  if [ "$default" = "y" ]; then
    suffix="[Y/n]"
  else
    suffix="[y/N]"
  fi

  read -r -p "$prompt $suffix " answer
  answer="${answer:-$default}"

  case "$answer" in
    y | Y | yes | YES) return 0 ;;
    n | N | no | NO) return 1 ;;
    *) die "Please answer yes or no." ;;
  esac
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

json_value() {
  node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); process.stdout.write(String(pkg['$1']));"
}

next_patch_version() {
  node -e "
const version = process.argv[1];
const match = version.match(/^([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:[-+].*)?$/);
if (!match) process.exit(1);
process.stdout.write([match[1], match[2], Number(match[3]) + 1].join('.'));
" "$1"
}

validate_version() {
  node -e "
const version = process.argv[1];
if (!/^[0-9]+\\.[0-9]+\\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?$/.test(version)) {
  process.exit(1);
}
" "$1"
}

set_package_version() {
  node -e "
const fs = require('fs');
const file = 'package.json';
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
pkg.version = process.argv[1];
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
" "$1"
}

show_changes() {
  printf "\nCurrent changes:\n"
  git status --short

  printf "\nChange summary:\n"
  git diff --stat

  printf "\nDependency and version diff:\n"
  git diff -- package.json yarn.lock example/package.json example/yarn.lock || true
}

require_command git
require_command node
require_command yarn

[ -f package.json ] || die "package.json was not found in $ROOT_DIR"
[ -d .git ] || die "This script must be run from a git checkout."

BRANCH="$(git symbolic-ref --quiet --short HEAD)" || die "Release must be created from a branch, not a detached HEAD."
SOURCE_BRANCH="develop"
RELEASE_BRANCH="main"
REMOTE="${RELEASE_REMOTE:-origin}"

printf "Current branch: %s\n" "$BRANCH"
printf "Source branch: %s\n" "$SOURCE_BRANCH"
printf "Release branch: %s\n" "$RELEASE_BRANCH"
printf "Release remote: %s\n" "$REMOTE"

if [ "$BRANCH" != "$SOURCE_BRANCH" ]; then
  die "Release must start from the '$SOURCE_BRANCH' branch. Current branch is '$BRANCH'."
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  die "Git remote '$REMOTE' does not exist. Set RELEASE_REMOTE to use a different remote."
fi

if [ -n "$(git status --porcelain)" ]; then
  printf "\nExisting worktree changes detected. These will be included in the release commit if you continue:\n"
  git status --short
  confirm "Continue with these changes included in the release?" "n" || die "Release cancelled."
fi

printf "\nUpgrading root dependencies...\n"
yarn up '*'
yarn install

if [ -f example/package.json ]; then
  if confirm "Upgrade example app dependencies too?" "y"; then
    printf "\nUpgrading example dependencies...\n"
    (cd example && yarn up '*')
    (cd example && yarn install)
  fi
fi

show_changes

confirm "Continue after reviewing these changes?" "y" || die "Release cancelled."

CURRENT_VERSION="$(json_value version)"
DEFAULT_VERSION="$(next_patch_version "$CURRENT_VERSION" || true)"

if [ -z "$DEFAULT_VERSION" ]; then
  DEFAULT_VERSION="$CURRENT_VERSION"
fi

printf "\nCurrent package version: %s\n" "$CURRENT_VERSION"
read -r -p "New package version [$DEFAULT_VERSION]: " NEW_VERSION
NEW_VERSION="${NEW_VERSION:-$DEFAULT_VERSION}"

validate_version "$NEW_VERSION" || die "Invalid semver version: $NEW_VERSION"

TAG="v$NEW_VERSION"

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  die "Tag already exists locally: $TAG"
fi

if git ls-remote --exit-code --tags "$REMOTE" "$TAG" >/dev/null 2>&1; then
  die "Tag already exists on $REMOTE: $TAG"
fi

printf "\nSetting package version to %s...\n" "$NEW_VERSION"
set_package_version "$NEW_VERSION"
yarn install

if confirm "Run tests and build before committing?" "y"; then
  yarn vitest run
  yarn build
fi

show_changes

confirm "Commit on $SOURCE_BRANCH, merge into $RELEASE_BRANCH, push $RELEASE_BRANCH, then tag $TAG on $RELEASE_BRANCH?" "n" || die "Release cancelled before commit."

git add -A
git commit -m "Release $TAG"

printf "\nPushing %s before merging into %s...\n" "$SOURCE_BRANCH" "$RELEASE_BRANCH"
git push "$REMOTE" "$SOURCE_BRANCH"

printf "\nSwitching to %s and updating it from %s...\n" "$RELEASE_BRANCH" "$REMOTE"
git switch "$RELEASE_BRANCH"
git pull --ff-only "$REMOTE" "$RELEASE_BRANCH"

printf "\nMerging %s into %s...\n" "$SOURCE_BRANCH" "$RELEASE_BRANCH"
git merge --no-ff "$SOURCE_BRANCH" -m "Merge $SOURCE_BRANCH for $TAG"

printf "\nPushing %s before creating the release tag...\n" "$RELEASE_BRANCH"
git push "$REMOTE" "$RELEASE_BRANCH"

git tag -a "$TAG" -m "Release $TAG"
git push "$REMOTE" "$TAG"

printf "\nSwitching back to %s...\n" "$SOURCE_BRANCH"
git switch "$SOURCE_BRANCH"

printf "\nRelease %s pushed to %s.\n" "$TAG" "$REMOTE"
