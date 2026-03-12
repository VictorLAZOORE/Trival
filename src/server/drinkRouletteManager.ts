import type {
  DrinkRouletteRoom,
  DrinkRoulettePlayer,
  DrinkRouletteClientRoom,
} from "@/types/drinkRoulette";
import { DRINK_ROULETTE_COLORS } from "@/types/drinkRoulette";

class DrinkRouletteManager {
  private rooms: Map<string, DrinkRouletteRoom> = new Map();

  generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.has(code)) return this.generateRoomCode();
    return code;
  }

  createRoom(hostSocketId: string, hostName: string): DrinkRouletteRoom {
    const code = this.generateRoomCode();
    const host: DrinkRoulettePlayer = {
      id: hostSocketId,
      name: hostName,
      color: DRINK_ROULETTE_COLORS[0],
      isHost: true,
    };

    const room: DrinkRouletteRoom = {
      code,
      host: hostSocketId,
      players: new Map([[hostSocketId, host]]),
      history: [],
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(
    code: string,
    playerId: string,
    playerName: string
  ): { room: DrinkRouletteRoom; player: DrinkRoulettePlayer } | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;
    if (room.players.size >= 12) return null;

    const color =
      DRINK_ROULETTE_COLORS[room.players.size % DRINK_ROULETTE_COLORS.length];
    const player: DrinkRoulettePlayer = {
      id: playerId,
      name: playerName,
      color,
      isHost: false,
    };

    room.players.set(playerId, player);
    return { room, player };
  }

  removePlayer(
    playerId: string
  ): { room: DrinkRouletteRoom; wasHost: boolean } | null {
    for (const [code, room] of this.rooms) {
      if (room.players.has(playerId)) {
        const wasHost = room.host === playerId;
        room.players.delete(playerId);

        if (room.players.size === 0) {
          this.rooms.delete(code);
          return { room, wasHost };
        }

        if (wasHost) {
          const newHost = room.players.values().next().value;
          if (newHost) {
            newHost.isHost = true;
            room.host = newHost.id;
          }
        }

        return { room, wasHost };
      }
    }
    return null;
  }

  getRoom(code: string): DrinkRouletteRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getOpenRooms(): DrinkRouletteClientRoom[] {
    const open: DrinkRouletteClientRoom[] = [];
    for (const room of this.rooms.values()) {
      if (room.players.size < 12) {
        open.push(this.toClientRoom(room));
      }
    }
    return open;
  }

  toClientRoom(room: DrinkRouletteRoom): DrinkRouletteClientRoom {
    return {
      code: room.code,
      host: room.host,
      players: Array.from(room.players.values()),
      history: [...room.history],
    };
  }

  spinRoulette(code: string): string | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;
    if (room.players.size === 0) return null;

    const players = Array.from(room.players.values());
    const winner = players[Math.floor(Math.random() * players.length)];
    room.history.push(winner.name);
    if (room.history.length > 10) room.history.shift();
    return winner.id;
  }
}

export const drinkRouletteManager = new DrinkRouletteManager();
