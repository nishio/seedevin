from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# WebSocket connections store
connected_clients = {}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    connected_clients[client_id] = websocket
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            if data["type"] == "signal" and data["target_id"] in connected_clients:
                await connected_clients[data["target_id"]].send_json({
                    "type": "signal",
                    "sender_id": client_id,
                    "data": data["signal"]
                })
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if client_id in connected_clients:
            del connected_clients[client_id]

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
