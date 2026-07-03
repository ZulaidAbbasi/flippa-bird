## Avengers character picker

Turn the Iron Man bird into one of several Avengers, chosen by the player.

### Roster (8 characters)
Each rendered procedurally on the canvas — no image assets — with a distinct palette and one signature detail. All share the same 14px hitbox and physics.

| Character | Body | Accent | Signature detail |
|---|---|---|---|
| Iron Man | red | gold | Cyan arc reactor + eye slits (current look) |
| Captain America | navy blue | red/white | White star on chest, red/white striped wing |
| Thor | grey armor | red cape | Hammer glint spark on chest, red cape trailing behind |
| Hulk | green | purple | Torn purple wing/shorts stripe, angry brow |
| Black Widow | black | red | Red hourglass on chest, red hair streak |
| Hawkeye | dark purple | black | Small arrow-shape wing, quiver dot |
| Spider-Man | red | blue | Web crosshatch on faceplate, big white eyes |
| Black Panther | matte black | silver | Silver necklace glow ring, glowing eyes |

### UI
- New row above the difficulty selector: horizontal scrollable list of 8 circular character chips, each showing a mini preview of that character.
- Selected chip has a yellow ring (matches existing accent).
- Locked while `state === "playing"` (like difficulty).
- Persisted to `localStorage` under `flippa-character`.

### Code shape
- Add `src/lib/characters.ts`:
  - `CharacterId` union type + `CHARACTERS` array with `id`, `name`, and a `draw(ctx, frame, flapAnim, isDark)` function per character.
  - Each `draw` handles body, wing, and signature detail so the render loop just calls `character.draw(...)`.
- `src/routes/index.tsx`:
  - Replace the inlined Iron Man drawing block with `CHARACTERS[selected].draw(ctx, g.frame, g.flapAnim, darkRef.current)` inside the existing translate/rotate save block.
  - Add `character` state + persistence + `characterRef` (same pattern as difficulty/dark).
  - Render the chip strip; each chip renders its character via a tiny `<canvas>` on mount.

### Out of scope
- No changes to physics, pipes, audio, HUD, or difficulty.
- No character-specific gameplay effects (e.g. Thor's hammer boost) — purely cosmetic.
