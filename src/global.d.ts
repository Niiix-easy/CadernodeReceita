/// <reference lib="dom" />
export {};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechSynthesis: SpeechSynthesis;
  }
  var alert: (message?: any) => void;
  var prompt: (message?: string, defaultValue?: string) => string | null;
  var localStorage: Storage;
  var document: Document;
}
