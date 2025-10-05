import { useState, useRef, useCallback } from 'react';
import type { AudioRecorderState } from '../types';

export interface UseAudioRecorderOptions {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in milliseconds, default 60000 (60 seconds)
  mimeType?: string; // default 'audio/webm'
}

export interface UseAudioRecorderReturn extends AudioRecorderState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  isSupported: boolean;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const {
    onRecordingComplete,
    onError,
    maxDuration = 60000, // 60 seconds default
    mimeType = 'audio/webm',
  } = options;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports audio recording
  const isSupported = typeof window !== 'undefined' && 
                      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // Clear previous recording
  const clearPreviousRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    audioChunksRef.current = [];
  }, [audioUrl]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Audio recording is not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      console.log('🎤 Starting audio recording...');
      
      // Clear previous recording
      clearPreviousRecording();
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Determine supported MIME type
      let selectedMimeType = mimeType;
      const supportedTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      console.log('🎙️ Using MIME type:', selectedMimeType);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: selectedMimeType 
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('✅ Recording stopped');
        
        // Create audio blob
        const blob = new Blob(audioChunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setIsPaused(false);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Clear intervals
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        if (maxDurationTimeoutRef.current) {
          clearTimeout(maxDurationTimeoutRef.current);
        }

        // Callback
        onRecordingComplete?.(blob, url);
      };

      // Handle errors
      mediaRecorder.onerror = (event: any) => {
        const errorMsg = `Recording error: ${event.error?.message || 'Unknown error'}`;
        console.error('❌', errorMsg);
        setError(errorMsg);
        setIsRecording(false);
        onError?.(errorMsg);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();

      // Update duration every 100ms
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
      }, 100);

      // Auto-stop after max duration
      maxDurationTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Max duration reached, stopping recording');
        stopRecording();
      }, maxDuration);

      console.log('🎤 Recording started');

    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to start recording';
      console.error('❌ Failed to start recording:', error);
      setError(errorMsg);
      setIsRecording(false);
      onError?.(errorMsg);
    }
  }, [isSupported, mimeType, maxDuration, clearPreviousRecording, onRecordingComplete, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      console.log('⏸️ Pausing recording...');
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  }, [isRecording, isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      console.log('▶️ Resuming recording...');
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume duration counter
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration;
      
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
      }, 100);
    }
  }, [isRecording, isPaused, duration]);

  // Reset recording
  const resetRecording = useCallback(() => {
    console.log('🔄 Resetting recording...');
    
    // Stop recording if in progress
    if (isRecording) {
      stopRecording();
    }

    // Clear state
    clearPreviousRecording();
    setIsRecording(false);
    setIsPaused(false);
    setError(null);
    
    // Clear refs
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    startTimeRef.current = 0;
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
    }
  }, [isRecording, stopRecording, clearPreviousRecording]);

  return {
    // State
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    duration,
    error,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
  };
}
