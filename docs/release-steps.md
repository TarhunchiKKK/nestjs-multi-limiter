# Release Steps

## Project Setup

1. Clean ol library build:

```bash
bun run clean:cache
```

2. Build library:

```bash
bun run build:lib
```

3. Bump library version.

4. Update `changelog.md`.

5. Update meta-files:

```bash
bun run sync-meta
```

## Git

1. Create commit:

```bash
git add .

git commit -m "chore(release): v${version_number}"

git push
```

2. Create tag:

```bash
git tag -a v${version_number}

git push origin v${version_number}
```

## Publish

```bash
cd lib

npm login

npm publish --access public
```

## GitHub Release

Format:

```bash
Release v${version_number}
```