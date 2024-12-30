import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

interface SignalData {
  type: string;
  sender_id: string;
  data: Peer.SignalData;
}

interface ScreenShareProps {
  mode: 'sender' | 'receiver';
  onStreamUpdate?: (stream: MediaStream | null) => void;
  targetPeerId?: string;
}

interface ConnectionStatus {
  status: string;
  details?: string;
}

export function ScreenShare({ mode, onStreamUpdate, targetPeerId }: ScreenShareProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [peerId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: '未接続' });
  const peerRef = useRef<Peer.Instance | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // WebSocketサーバーに接続
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${peerId}`);

    wsRef.current.onopen = () => {
      console.log('Connected to signaling server');
      setConnectionStatus({ status: 'シグナリングサーバーに接続済み' });
    };

    wsRef.current.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as SignalData;
      if (data.type === 'signal' && peerRef.current) {
        peerRef.current.signal(data.data);
      }
    };

    return () => {
      wsRef.current?.close();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [peerId]);

  const startScreenShare = async () => {
    try {
      if (mode === 'receiver' && targetPeerId) {
        // 受信側の処理
        const peer = new Peer({
          initiator: false,
          trickle: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' }
            ]
          }
        });

        peer.on('signal', (data: Peer.SignalData) => {
          wsRef.current?.send(JSON.stringify({
            type: 'signal',
            target_id: targetPeerId,
            signal: data
          }));
          setConnectionStatus({ status: 'シグナリング中', details: '送信側との接続を確立しています...' });
        });

        peer.on('connect', () => {
          setConnectionStatus({ status: '接続済み', details: '送信側と接続されました' });
          setIsConnected(true);
        });

        peer.on('stream', (stream: MediaStream) => {
          if (onStreamUpdate) onStreamUpdate(stream);
        });

        peer.on('error', (err: Error) => {
          console.error('Peer error:', err);
          setConnectionStatus({ status: 'エラー', details: err.message });
          stopScreenShare();
        });

        peerRef.current = peer;
        return;
      }

      // 送信側の処理
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      // 低レイテンシーのための設定
      stream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          const videoTrack = track as MediaStreamTrack;
          videoTrack.contentHint = 'motion';
        }
      });
      
      streamRef.current = stream;
      if (onStreamUpdate) onStreamUpdate(stream);

      const peer = new Peer({
        initiator: mode === 'sender',
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (data: Peer.SignalData) => {
        wsRef.current?.send(JSON.stringify({
          type: 'signal',
          target_id: mode === 'sender' ? 'receiver' : 'sender',
          signal: data
        }));
        setConnectionStatus({ status: 'シグナリング中', details: '接続を確立しています...' });
      });

      peer.on('connect', () => {
        setConnectionStatus({ status: '接続済み', details: 'ピア接続が確立されました' });
        setIsConnected(true);
      });

      peer.on('stream', (stream: MediaStream) => {
        if (onStreamUpdate) onStreamUpdate(stream);
      });

      peer.on('error', (err: Error) => {
        console.error('Peer error:', err);
        setConnectionStatus({ status: 'エラー', details: err.message });
        stopScreenShare();
      });

      peerRef.current = peer;
      setIsConnected(true);
    } catch (err) {
      console.error('Error accessing screen share:', err);
    }
  };

  const stopScreenShare = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    peerRef.current?.destroy();
    setIsConnected(false);
    if (onStreamUpdate) onStreamUpdate(null);
  };

  return {
    isConnected,
    startScreenShare,
    stopScreenShare,
    peerId,
    connectionStatus: connectionStatus.status,
    connectionDetails: connectionStatus.details
  };
}
