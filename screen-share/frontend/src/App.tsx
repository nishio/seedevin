import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScreenShare } from './components/ScreenShare';

function App() {
  const [senderStream, setSenderStream] = useState<MediaStream | null>(null);
  const [receiverStream, setReceiverStream] = useState<MediaStream | null>(null);
  const [targetPeerId, setTargetPeerId] = useState<string>('');

  const senderVideoRef = useRef<HTMLVideoElement>(null);
  const receiverVideoRef = useRef<HTMLVideoElement>(null);
  const { isConnected: isSenderConnected, startScreenShare: startSending, stopScreenShare: stopSending, peerId: senderPeerId, connectionStatus: senderConnectionStatus, connectionDetails: senderConnectionDetails } = ScreenShare({
    mode: 'sender',
    onStreamUpdate: (stream) => {
      setSenderStream(stream);
      if (senderVideoRef.current && stream) {
        senderVideoRef.current.srcObject = stream;
      }
    }
  });

  const { isConnected: isReceiverConnected, startScreenShare: startReceiving, stopScreenShare: stopReceiving, connectionStatus: receiverConnectionStatus, connectionDetails: receiverConnectionDetails } = ScreenShare({
    mode: 'receiver',
    targetPeerId,
    onStreamUpdate: (stream) => {
      setReceiverStream(stream);
      if (receiverVideoRef.current && stream) {
        receiverVideoRef.current.srcObject = stream;
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">画面共有アプリ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>送信側 - {senderConnectionStatus}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">
                ID: {senderPeerId}
              </p>
              {senderStream && (
                <video
                  ref={senderVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video bg-gray-200 rounded-lg mb-4"
                />
              )}
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={isSenderConnected ? stopSending : startSending}
                  variant={isSenderConnected ? "destructive" : "default"}
                >
                  {isSenderConnected ? "画面共有を停止" : "画面共有を開始"}
                </Button>
                <p className="text-sm text-center text-gray-500">
                  {senderConnectionDetails || (isSenderConnected ? "画面共有中" : "画面共有を開始するにはボタンをクリックしてください")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>受信側 - {receiverConnectionStatus}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="送信側のIDを入力"
                    className="flex-1 px-3 py-2 border rounded"
                    value={targetPeerId}
                    onChange={(e) => setTargetPeerId(e.target.value)}
                  />
                  <Button
                    onClick={isReceiverConnected ? stopReceiving : startReceiving}
                    disabled={!targetPeerId}
                  >
                    {isReceiverConnected ? "切断" : "接続"}
                  </Button>
                </div>
                {receiverStream && (
                  <video
                    ref={receiverVideoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-video bg-gray-200 rounded-lg"
                  />
                )}
                <p className="text-sm text-center text-gray-500">
                  {receiverConnectionDetails || "送信側のIDを入力して接続してください"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
