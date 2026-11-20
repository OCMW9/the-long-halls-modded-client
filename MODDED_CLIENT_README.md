# The Long Halls — Modded Client (development build)

This is a separate client copy. It retains the original game's Firebase multiplayer code and party protocol. The mod menu is loaded by `index.html` after the game runtime and opens with **Right Shift**.

## Added in this build

### Player
- Movement speed
- Infinite stamina
- Infinite flashlight battery
- No clip
- No damage
- Teleport to monster
- Teleport to exit
- Teleport to a selected alive player

### World
- Unlock all doors (host)
- Open all doors (host)
- Open all vents (host; sends the existing vent-open world updates)
- Claim all fuses (uses the existing shared fuse transactions in multiplayer; the Firebase rules must permit normal fuse writes)
- Give bottles, batteries, brass key, and screwdriver (host)

### Host
- Monster speed
- Freeze monster
- Teleport monster to host
- Teleport monster to a selected alive player
- Force patrol, chase, or investigate

### Visuals
- Fullbright (local client only)
- Player ESP labels/markers through walls (local client only; players hidden in lockers/vents remain hidden)
- Field of view
- Brightness

## Run locally

Open this folder in VS Code, right-click `index.html`, and choose **Open with Live Server**. Keep the Live Server session running while playing. Right Shift opens/closes the mod menu.

## Multiplayer notes

- The modified client uses the same Firebase project, room codes, and data paths as the original game.
- Host-authoritative actions are marked HOST ONLY in the menu.
- Fuse claiming uses the same `w/f/<fuse-id>` transaction used by ordinary fuse pickup. Whether guest writes are accepted depends on the existing Firebase Realtime Database rules; this client cannot override server rules.
- Monster teleporting and vent opening are sent through the game's existing host/world synchronization paths.
- ESP and fullbright are client-side only.

This is a development build. Test with a private party first; some behavior depends on the live Firebase rules and current game state.
