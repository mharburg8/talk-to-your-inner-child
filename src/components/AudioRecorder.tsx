'use client';

import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`px-8 py-4 rounded-full font-semibold text-white transition-all ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : 'bg-primary-600 hover:bg-primary-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isRecording ? '🎙️ Stop Recording' : '🎤 Start Recording'}
      </button>

      {isRecording && (
        <p className="text-sm text-gray-600">
          Recording in progress... Click again to stop
        </p>
      )}
    </div>
  );
}