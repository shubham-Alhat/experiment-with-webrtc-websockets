import { WebSocketServer } from "ws";
import http from "http";

class WebsocketManager {
  constructor(server: http.Server) {
    this.handleUpgradeConnection(server);
  }

  private handleUpgradeConnection(server: http.Server) {}
}
