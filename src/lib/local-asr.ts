import type { TranscriptDocument } from "@/lib/transcript-editor";

export const LOCAL_ASR_MODELS = [
  {
    id: "onnx-community/whisper-tiny_timestamped",
    label: "Tiny",
    description: "Fastest — good for getting started and shorter clips",
  },
  {
    id: "onnx-community/whisper-base_timestamped",
    label: "Base",
    description: "Bigger capacity; slower to download and transcribe",
  },
  {
    id: "onnx-community/whisper-small_timestamped",
    label: "Small",
    description: "Larger local option, needs more memory; pick after evaluating on samples",
  },
] as const;

export type LocalAsrModel = (typeof LOCAL_ASR_MODELS)[number]["id"];
export type LocalAsrDevice = "webgpu" | "wasm";

export function isLocalAsrModel(value: unknown): value is LocalAsrModel {
  return LOCAL_ASR_MODELS.some((model) => model.id === value);
}
export interface AsrWorkerRequest {
  type: "transcribe";
  audio: Float32Array;
  model: LocalAsrModel;
  language: string;
  preferWebGpu: boolean;
  offsetSeconds?: number;
  sourceDuration?: number;
  chunkIndex?: number;
}

export type AsrWorkerMessage =
  | { type: "device"; device: LocalAsrDevice; fallback?: boolean }
  | { type: "progress"; phase: "loading" | "transcribing"; progress: number; detail?: string }
  | { type: "complete"; transcript: TranscriptDocument }
  | { type: "error"; error: string };
