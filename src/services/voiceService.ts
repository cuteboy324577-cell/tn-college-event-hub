// Web Speech API Voice Recognition & Speech Synthesis Service
// Provides browser-native speech-to-text and text-to-speech with graceful fallbacks

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  supported: boolean;
}

export type VoiceStateListener = (state: VoiceRecognitionState) => void;

class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentTranscript: string = '';
  private interimTranscript: string = '';
  private listeners: Set<VoiceStateListener> = new Set();
  private autoSpeak: boolean = true;
  private isSpeaking: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined') {
      try {
        const storedAutoSpeak = localStorage.getItem('ceh_ai_voice_autospeak');
        if (storedAutoSpeak !== null) {
          this.autoSpeak = storedAutoSpeak === 'true';
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Initialize SpeechRecognition if supported by browser
  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.interimTranscript = '';
        this.notifyState();
        this.playBeep(440, 0.08); // Friendly start chime
      };

      this.recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }

        if (finalStr) {
          this.currentTranscript = finalStr;
        }
        this.interimTranscript = interimStr;
        this.notifyState();
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        this.isListening = false;
        this.notifyState(event.error === 'no-speech' ? null : `Microphone: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyState();
      };
    } catch (e) {
      console.warn('Failed to construct SpeechRecognition:', e);
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public isTtsSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): VoiceRecognitionState {
    return {
      isListening: this.isListening,
      transcript: this.currentTranscript,
      interimTranscript: this.interimTranscript,
      error: null,
      supported: this.isSupported(),
    };
  }

  private notifyState(error: string | null = null) {
    const state: VoiceRecognitionState = {
      isListening: this.isListening,
      transcript: this.currentTranscript,
      interimTranscript: this.interimTranscript,
      error,
      supported: this.isSupported(),
    };
    this.listeners.forEach((fn) => fn(state));
  }

  // Start voice recording session
  public startListening(onResult?: (finalText: string) => void): boolean {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        this.notifyState('Speech recognition is not available in this browser. Please use Chrome, Edge, or Safari.');
        return false;
      }
    }

    // Stop speaking if currently speaking
    this.stopSpeaking();

    this.currentTranscript = '';
    this.interimTranscript = '';

    try {
      if (onResult) {
        this.recognition.onresult = (event: any) => {
          let finalStr = '';
          let interimStr = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalStr += event.results[i][0].transcript;
            } else {
              interimStr += event.results[i][0].transcript;
            }
          }
          if (finalStr) {
            this.currentTranscript = finalStr;
            onResult(finalStr.trim());
          }
          this.interimTranscript = interimStr;
          this.notifyState();
        };
      }

      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn('SpeechRecognition start error:', e);
      // If already started, stop and restart
      try {
        this.recognition.stop();
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (err) {
            // ignore
          }
        }, 150);
      } catch (err) {
        // ignore
      }
      return false;
    }
  }

  // Stop recording
  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.notifyState();
  }

  // Text to Speech
  public speak(text: string, onEnd?: () => void): void {
    if (!this.isTtsSupported() || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior audio

      // Strip markdown asterisks, hashes, backticks, emojis, and brackets for natural sounding voice
      const cleanText = text
        .replace(/[*#_`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\n+/g, '. ')
        .trim();

      if (!cleanText) {
        if (onEnd) onEnd();
        return;
      }

      // Pick first 2-3 sentences to keep voice feedback crisp and concise
      const sentences = cleanText.split(/(?<=[.?!])\s+/);
      const voiceText = sentences.slice(0, 3).join(' ');

      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.rate = 1.05; // Slightly upbeat conversational pace
      utterance.pitch = 1.02;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) &&
          v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.isSpeaking = true;

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking(): void {
    if (this.isTtsSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getAutoSpeak(): boolean {
    return this.autoSpeak;
  }

  public setAutoSpeak(val: boolean): void {
    this.autoSpeak = val;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ceh_ai_voice_autospeak', String(val));
      } catch (e) {
        // ignore
      }
    }
    if (!val) {
      this.stopSpeaking();
    }
  }

  // Synthesize soft audio tone
  private playBeep(freq: number, duration: number) {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext may be blocked before user interaction
    }
  }
}

export const voiceService = new VoiceService();
