(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.VoiceController = api;
    }
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const MODES = Object.freeze({
        OFF: 'off',
        ASSISTED: 'assisted',
        VOICE_FIRST: 'voice-first'
    });

    const COMMAND_PATTERNS = [
        ['submit', /^(submit|check|check answer|abschicken|prufen|antwort prufen)$/],
        ['retry', /^(retry|try again|again|noch einmal|nochmal|neu aufnehmen)$/],
        ['repeat', /^(repeat|repeat question|wiederholen|frage wiederholen)$/],
        ['hint', /^(hint|help|hinweis|tipp|hilfe)$/],
        ['stop', /^(stop|voice off|stop voice|stimme aus|sprachmodus aus)$/]
    ];

    function normalizeSpeech(value) {
        return String(value || '')
            .toLocaleLowerCase('de-DE')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parseVoiceCommand(value) {
        const normalized = normalizeSpeech(value);
        const match = COMMAND_PATTERNS.find(([, pattern]) => pattern.test(normalized));
        return match ? match[0] : null;
    }

    function buildPromptSegments({ stepNumber, totalSteps, name, voicePrompt, startSentence }) {
        return [
            {
                text: `Step ${stepNumber} of ${totalSteps}. ${name}. ${voicePrompt}`,
                lang: 'en-US'
            },
            {
                text: `Starting sentence: ${startSentence}`,
                lang: 'de-DE'
            }
        ];
    }

    function recognitionErrorMessage(errorCode) {
        const messages = {
            'not-allowed': 'Microphone permission was denied. Allow microphone access and try again.',
            'service-not-allowed': 'Speech recognition is blocked by the browser or operating system.',
            'audio-capture': 'No working microphone was found.',
            'no-speech': 'No speech was detected. Please try again.',
            'network': 'The browser speech-recognition service could not be reached.',
            'language-not-supported': 'German speech recognition is not available in this browser.'
        };
        return messages[errorCode] || 'Speech recognition stopped unexpectedly. Please try again.';
    }

    class Controller {
        constructor({
            environment = typeof window !== 'undefined' ? window : {},
            synthesis = environment.speechSynthesis,
            Utterance = environment.SpeechSynthesisUtterance,
            Recognition = environment.SpeechRecognition || environment.webkitSpeechRecognition,
            mediaDevices = environment.navigator && environment.navigator.mediaDevices,
            onStateChange = () => {},
            onTranscript = () => {},
            onCommand = () => {},
            onError = () => {}
        } = {}) {
            this.synthesis = synthesis;
            this.Utterance = Utterance;
            this.Recognition = Recognition;
            this.mediaDevices = mediaDevices;
            this.onStateChange = onStateChange;
            this.onTranscript = onTranscript;
            this.onCommand = onCommand;
            this.onError = onError;
            this.mode = MODES.OFF;
            this.state = 'idle';
            this.activeRecognition = null;
            this.speechToken = 0;
            this.microphoneReady = false;
        }

        get capabilities() {
            return {
                synthesis: Boolean(this.synthesis && this.Utterance),
                recognition: Boolean(this.Recognition)
            };
        }

        setMode(mode) {
            if (!Object.values(MODES).includes(mode)) {
                throw new TypeError(`Unsupported voice mode: ${mode}`);
            }
            this.mode = mode;
            if (mode === MODES.OFF) {
                this.stopAll();
            }
        }

        setState(state, detail = '') {
            this.state = state;
            this.onStateChange({ state, detail });
        }

        stopListening() {
            if (this.activeRecognition) {
                this.activeRecognition.stopRequested = true;
                this.activeRecognition.stop();
            }
        }

        stopAll() {
            this.speechToken += 1;
            if (this.synthesis) {
                this.synthesis.cancel();
            }
            if (this.activeRecognition) {
                this.activeRecognition.abort();
                this.activeRecognition = null;
            }
            this.setState('idle');
        }

        selectVoice(lang) {
            if (!this.synthesis || typeof this.synthesis.getVoices !== 'function') {
                return undefined;
            }
            const prefix = lang.toLocaleLowerCase().split('-')[0];
            return this.synthesis.getVoices().find(voice =>
                voice.lang && voice.lang.toLocaleLowerCase().startsWith(prefix)
            );
        }

        async speakSegments(segments) {
            if (this.mode === MODES.OFF || !this.capabilities.synthesis || segments.length === 0) {
                return false;
            }

            this.speechToken += 1;
            const token = this.speechToken;
            this.synthesis.cancel();
            if (this.activeRecognition) {
                this.activeRecognition.abort();
                this.activeRecognition = null;
            }
            this.setState('speaking');

            for (const segment of segments) {
                if (token !== this.speechToken) return false;
                await new Promise(resolve => {
                    const utterance = new this.Utterance(segment.text);
                    utterance.lang = segment.lang || 'en-US';
                    utterance.rate = segment.rate || 0.94;
                    utterance.pitch = segment.pitch || 1;
                    utterance.voice = this.selectVoice(utterance.lang);
                    utterance.onend = resolve;
                    utterance.onerror = resolve;
                    this.synthesis.speak(utterance);
                });
            }

            if (token === this.speechToken) {
                this.setState('idle');
                return true;
            }
            return false;
        }

        speakPrompt(prompt) {
            return this.speakSegments(buildPromptSegments(prompt));
        }

        speakHint(example) {
            return this.speakSegments([
                { text: 'Here is an example.', lang: 'en-US' },
                { text: example, lang: 'de-DE', rate: 0.88 }
            ]);
        }

        readBack(transcript) {
            return this.speakSegments([
                { text: 'I heard:', lang: 'en-US' },
                { text: transcript, lang: 'de-DE', rate: 0.88 },
                { text: 'Submit it, try again, or use a voice command.', lang: 'en-US' }
            ]);
        }

        speakFeedback(feedback) {
            return this.speakSegments([{ text: feedback, lang: 'en-US' }]);
        }

        startAnswerListening() {
            return this.startListening('answer');
        }

        startCommandListening() {
            return this.startListening('command');
        }

        async ensureMicrophoneAccess() {
            if (this.microphoneReady) return true;
            if (!this.mediaDevices || typeof this.mediaDevices.getUserMedia !== 'function') {
                this.onError('Microphone access is unavailable here. Open the app from localhost in a full browser.');
                return false;
            }

            this.setState('requesting-permission');
            try {
                const stream = await this.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                this.microphoneReady = true;
                return true;
            } catch (error) {
                const errorCode = error && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
                    ? 'not-allowed'
                    : error && error.name === 'NotFoundError'
                        ? 'audio-capture'
                        : '';
                this.setState('error', errorCode);
                this.onError(recognitionErrorMessage(errorCode));
                return false;
            }
        }

        async startListening(kind) {
            if (this.mode === MODES.OFF) return false;
            if (!this.capabilities.recognition) {
                this.onError('Speech recognition is not available in this browser.');
                return false;
            }
            if (!await this.ensureMicrophoneAccess()) return false;

            this.speechToken += 1;
            if (this.synthesis) this.synthesis.cancel();
            if (this.activeRecognition) this.activeRecognition.abort();

            const recognition = new this.Recognition();
            const listeningState = `listening-${kind}`;
            let finalTranscript = '';
            let hadError = false;
            let startedAt = 0;
            this.activeRecognition = recognition;
            recognition.stopRequested = false;
            recognition.lang = kind === 'answer' ? 'de-DE' : 'en-US';
            recognition.continuous = false;
            recognition.interimResults = kind === 'answer';
            recognition.maxAlternatives = 3;

            recognition.onstart = () => {
                startedAt = Date.now();
                this.setState(listeningState, 'microphone');
            };
            recognition.onaudiostart = () => this.setState(listeningState, 'audio');
            recognition.onspeechstart = () => this.setState(listeningState, 'speech');
            recognition.onresult = event => {
                let interimTranscript = '';
                for (let index = event.resultIndex; index < event.results.length; index += 1) {
                    const transcript = event.results[index][0].transcript.trim();
                    if (event.results[index].isFinal) {
                        finalTranscript = `${finalTranscript} ${transcript}`.trim();
                    } else {
                        interimTranscript = `${interimTranscript} ${transcript}`.trim();
                    }
                }

                if (kind === 'answer') {
                    this.onTranscript((finalTranscript || interimTranscript).trim(), Boolean(finalTranscript));
                } else if (finalTranscript) {
                    this.onCommand(parseVoiceCommand(finalTranscript), finalTranscript);
                }
            };
            recognition.onerror = event => {
                hadError = true;
                this.setState('error', event.error);
                this.onError(recognitionErrorMessage(event.error));
            };
            recognition.onend = () => {
                if (this.activeRecognition === recognition) {
                    this.activeRecognition = null;
                }
                if (this.state === listeningState) {
                    if (kind === 'answer' && finalTranscript) {
                        this.setState('review');
                    } else if (!hadError) {
                        const elapsed = startedAt ? Date.now() - startedAt : 0;
                        const message = !recognition.stopRequested && elapsed < 1500
                            ? 'Speech recognition ended before microphone audio became available. Try a full Chrome, Edge, or Safari browser if this continues.'
                            : 'No speech was recognized. Keep the microphone active until you finish the sentence, then try again.';
                        this.setState('error', 'no-result');
                        this.onError(message);
                    }
                }
            };

            recognition.start();
            return true;
        }
    }

    return {
        MODES,
        Controller,
        buildPromptSegments,
        normalizeSpeech,
        parseVoiceCommand,
        recognitionErrorMessage
    };
});
