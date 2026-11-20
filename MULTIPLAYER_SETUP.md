# Multiplayer compatibility

The modded client retains the original Firebase Realtime Database configuration and multiplayer protocol from the supplied game source. It uses the same five-character party codes and existing room paths.

## Expected compatibility

- Modded client can create or join a room using the same multiplayer flow.
- Original clients can join a room hosted by the modded client.
- Modded clients can join rooms hosted by original clients.
- Client-only visual changes (fullbright and player ESP) are not broadcast.
- Host-only changes use the existing host/world update paths.

## Important limits

Firebase Realtime Database security rules are server-side. A modified client cannot grant itself permissions that the database denies. The `Claim all fuses` option attempts the same fuse transaction used by normal pickup; if guest writes are blocked, the server will reject it. This project does not change database rules.

Test in a private party before using the build with other players.
