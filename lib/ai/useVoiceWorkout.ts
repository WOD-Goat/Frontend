import { aiService } from "@/api/services/ai";
import type { CreateWorkoutData } from "@/types";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { File } from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceRecordingState =
  | "idle"
  | "recording"
  | "processing"
  | "review"
  | "error";

export interface VoiceWorkoutResult {
  transcript: string;
  data: CreateWorkoutData;
}

export function useVoiceWorkout() {
  const [recordingState, setRecordingState] =
    useState<VoiceRecordingState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<VoiceWorkoutResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      setResult(null);

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(
          "Microphone permission is required to use voice input.",
        );
        setRecordingState("error");
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      isRecordingRef.current = true;
      setRecordingState("recording");
      setElapsedSeconds(0);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Failed to start recording.");
      setRecordingState("error");
    }
  }, [recorder]);

  const stopAndProcess = useCallback(async () => {
    if (!isRecordingRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    isRecordingRef.current = false;
    setRecordingState("processing");

    try {
      await recorder.stop();
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      const uri = recorder.uri;
      if (!uri) throw new Error("Recording failed — no audio captured.");

      const audioFile = new File(uri);
      const base64 = await audioFile.base64();

      const ext = uri.split(".").pop()?.toLowerCase();
      const mimeType =
        ext === "m4a"
          ? "audio/m4a"
          : ext === "3gp"
            ? "audio/3gpp"
            : ext === "wav"
              ? "audio/wav"
              : ext === "webm"
                ? "audio/webm"
                : "audio/m4a"; // fallback

      const response = await aiService.parseVoiceWorkout({
        audio: base64,
        mimeType,
      });

      // Clean up temp file regardless of outcome
      audioFile.delete();

      if (response.success && response.data) {
        setResult({
          transcript: response.data.transcript,
          data: response.data.parsedWorkout,
        });
        setRecordingState("review");
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } else {
        setErrorMessage(response.message ?? "Could not understand workout.");
        setRecordingState("error");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Failed to process recording.");
      setRecordingState("error");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [recorder]);

  const reset = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (isRecordingRef.current) {
      try {
        await recorder.stop();
      } catch {}
      isRecordingRef.current = false;
    }
    setRecordingState("idle");
    setElapsedSeconds(0);
    setResult(null);
    setErrorMessage(null);
  }, [recorder]);

  return {
    recordingState,
    elapsedSeconds,
    result,
    errorMessage,
    startRecording,
    stopAndProcess,
    reset,
  };
}
