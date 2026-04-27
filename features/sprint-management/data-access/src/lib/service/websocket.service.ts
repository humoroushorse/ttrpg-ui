import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, Observable, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
type SprintManagementApiServiceConfig = SprintModels.Service.SprintManagementApiServiceConfig;

export interface WebSocketMessage {
  type: string;
  room?: string;
  data: any;
  trace_id?: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly serviceConfig: SprintManagementApiServiceConfig = inject(SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN);

  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatus = new Subject<boolean>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1_000;
  private currentRoom: string | null = null;

  public messages$ = this.messageSubject.asObservable();
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnect();
    });
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = this.getWebSocketUrl();

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.connectionStatus.next(true);

        // Rejoin room if we were in one
        if (this.currentRoom) {
          this.joinRoom(this.currentRoom);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      // this.socket.onerror = (error) => {
      //   console.error('[WebSocket] Error:', error);
      // };

      this.socket.onclose = (event) => {
        this.connectionStatus.next(false);
        this.socket = null;

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.currentRoom = null;
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
      this.connectionStatus.next(false);
    }
  }

  joinRoom(room: string): void {
    this.currentRoom = room;
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'join_room',
        room: room,
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  leaveRoom(): void {
    if (this.currentRoom && this.socket?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'leave_room',
        room: this.currentRoom,
      };
      this.socket.send(JSON.stringify(message));
      this.currentRoom = null;
    }
  }

  getMessagesByType(type: string): Observable<WebSocketMessage> {
    return this.messages$.pipe(filter((msg) => msg.type === type));
  }

  getMessagesByRoom(room: string): Observable<WebSocketMessage> {
    return this.messages$.pipe(filter((msg) => msg.room === room));
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private getWebSocketUrl(): string {
    const httpBase = this.serviceConfig.appConfig().APP_SPRINT_MANAGEMENT__API_BASE_PATH;
    const wsBase = httpBase.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    return `${wsBase}/ws`;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    timer(delay)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.connect();
      });
  }
}
