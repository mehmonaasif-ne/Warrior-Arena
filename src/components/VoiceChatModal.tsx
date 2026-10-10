import React, { useState, useEffect, useRef } from 'react';
import { VoiceChatMessage } from '../types/game';
import { sound } from '../utils/audio';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighterName: string;
  onVoiceCommand?: (command: string) => void;
}

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  fighterName,
  onVoiceCommand,
}) => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([
    {
      id: '1',
      sender: 'Mehmona Jabeen (Grand Champion)',
      text: 'Voice channel online! Ready your stances, warriors. Fight with honor!',
      timestamp: 'Now',
      isAi: true,
      fighterId: 'mehmona',
    },
    {
      id: '2',
      sender: 'Arena Comm Link',
      text: 'Microphone and squad audio linked. You can speak or type to teammates.',
      timestamp: 'Now',
      isAi: true,
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        // Check for Combat Voice Commands if active
        if (voiceCommandsEnabled && onVoiceCommand) {
          const lower = currentTranscript.toLowerCase();
          if (lower.includes('punch') || lower.includes('jab')) onVoiceCommand('punch');
          if (lower.includes('kick')) onVoiceCommand('kick');
          if (lower.includes('fireball') || lower.includes('special') || lower.includes('blast') || lower.includes('gun')) onVoiceCommand('special');
          if (lower.includes('shield') || lower.includes('block')) onVoiceCommand('block');
          if (lower.includes('super') || lower.includes('ultra')) onVoiceCommand('super');
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [voiceCommandsEnabled, onVoiceCommand]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can still use the chat input.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        handleSendMessage(transcript.trim());
        setTranscript('');
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        sound.playHitLight();
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: VoiceChatMessage = {
      id: Date.now().toString(),
      sender: 'You (Player)',
      text: textToSend,
      timestamp: 'Just now',
      isAi: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          speakerName: fighterName,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const replyMsg: VoiceChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: `${fighterName} (Squad)`,
          text: data.reply,
          timestamp: 'Just now',
          isAi: true,
        };
        setMessages((prev) => [...prev, replyMsg]);
        sound.announce(data.reply);
      }
    } catch (e) {
      const fallbackMsg: VoiceChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Arena Sensei',
        text: 'Keep the momentum going! Deliver the winning strike!',
        timestamp: 'Just now',
        isAi: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      sound.announce(fallbackMsg.text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-[#160629] border-2 border-purple-500/50 shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#2e1065] to-[#1a0833] border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isRecording ? 'bg-white animate-ping' : 'bg-purple-400'}`} />
            <div>
              <h2 className="text-xl font-black text-white font-['Bungee'] tracking-wider">ARENA VOICE CHAT</h2>
              <p className="text-xs text-purple-200">Live Team & Fighter Comms with Voice Recognition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-purple-950 hover:bg-purple-900 border border-purple-600 text-white flex items-center justify-center font-bold text-base transition"
          >
            ✕
          </button>
        </div>

        {/* Voice Combat Control Toggle */}
        <div className="p-3 bg-[#110421] border-b border-purple-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">🎙️ Voice Combat Commands:</span>
            <span className="text-purple-300">Speak "Punch", "Kick", "Fireball", "Super" to execute moves!</span>
          </div>
          <button
            onClick={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)}
            className={`px-3 py-1 rounded-xl font-bold transition ${
              voiceCommandsEnabled
                ? 'bg-white text-purple-950 shadow-md shadow-white/30'
                : 'bg-purple-950 text-purple-300 border border-purple-800'
            }`}
          >
            {voiceCommandsEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Message Log */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 min-h-[260px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-2xl max-w-[85%] text-xs flex flex-col gap-1 ${
                m.isAi
                  ? 'bg-purple-950/80 text-purple-100 border border-purple-700/60 self-start'
                  : 'bg-white text-purple-950 font-bold self-end shadow-md shadow-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                <span className="font-bold">{m.sender}</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{m.text}</p>
            </div>
          ))}

          {isRecording && transcript && (
            <div className="p-3 rounded-2xl bg-[#2e1065] border border-white self-end text-xs text-white italic animate-pulse">
              Listening: "{transcript}"
            </div>
          )}
        </div>

        {/* Voice Input & Action Bar */}
        <div className="p-3.5 bg-[#0e021a] border-t border-purple-800/50 flex items-center gap-2">
          {/* Big Mic Button */}
          <button
            onClick={toggleMic}
            className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
              isRecording
                ? 'bg-white text-purple-950 animate-pulse shadow-white/50'
                : 'bg-purple-700 hover:bg-purple-600 text-white shadow-purple-900/40 border border-purple-400'
            }`}
          >
            <span className="text-lg">🎙️</span>
            <span>{isRecording ? 'MUTE MIC' : 'HOLD / SPEAK'}</span>
          </button>

          <input
            type="text"
            placeholder="Type message or battle shout..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputVal);
            }}
            className="flex-1 px-4 py-3 rounded-2xl bg-purple-950/70 border border-purple-700/60 text-xs text-white placeholder-purple-400 focus:outline-none focus:border-white"
          />

          <button
            onClick={() => handleSendMessage(inputVal)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-purple-100 text-purple-950 font-black text-xs transition shadow-md shadow-white/20"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};
