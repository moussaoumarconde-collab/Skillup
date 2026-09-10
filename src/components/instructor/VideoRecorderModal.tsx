'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Square,
  RefreshCw,
  Check,
  X,
  UploadCloud,
  FileVideo,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoReady: (videoUrl: string, estimatedDuration?: string) => void;
}

type TabMode = 'record' | 'upload';

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  isOpen,
  onClose,
  onVideoReady,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('record');

  // Recording states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoLiveRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Démarrer le flux caméra lors de l'ouverture
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès caméra/microphone n'est pas supporté par ce navigateur.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      setStream(mediaStream);
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('[VideoRecorder] Erreur accès caméra:', err);
      let msg = "Impossible d'accéder à la caméra ou au microphone.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Permission refusée. Veuillez autoriser l'accès à la caméra et au microphone.";
      } else if (err.name === 'NotFoundError') {
        msg = "Aucune caméra ou microphone détecté sur cet appareil.";
      }
      setCameraError(msg);
    }
  }, []);

  // Stopper le flux caméra
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoLiveRef.current) {
      videoLiveRef.current.srcObject = null;
    }
  }, [stream]);

  // Initialisation à l'ouverture
  useEffect(() => {
    if (isOpen && activeTab === 'record') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Connecter le srcObject dès que stream change
  useEffect(() => {
    if (videoLiveRef.current && stream && recordingStatus === 'idle') {
      videoLiveRef.current.srcObject = stream;
    }
  }, [stream, recordingStatus]);

  // Gestion du chronomètre d'enregistrement
  useEffect(() => {
    if (recordingStatus === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingStatus]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Démarrer l'enregistrement
  const handleStartRecording = () => {
    if (!stream) return;
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setRecordingSeconds(0);

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedChunks(chunks);
        setRecordedVideoUrl(url);
        setRecordingStatus('stopped');
        stopCamera();
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setRecordingStatus('recording');
    } catch (err) {
      console.error('[VideoRecorder] Erreur enregistrement:', err);
      setCameraError("Échec du démarrage de l'enregistrement.");
    }
  };

  // Arrêter l'enregistrement
  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  // Recommencer une prise
  const handleResetRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedChunks([]);
    setRecordingSeconds(0);
    setRecordingStatus('idle');
    startCamera();
  };

  // Toggle caméra vidéo
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Sélection d'un fichier vidéo local
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Veuillez sélectionner un fichier vidéo valide (MP4, WebM, MOV, etc.).');
      return;
    }

    setUploadError(null);
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setUploadedPreviewUrl(url);
  };

  // Validation finale et injection dans la leçon
  const handleConfirmVideo = () => {
    let finalUrl = '';
    let durationText = '5 min';

    if (activeTab === 'record' && recordedVideoUrl) {
      finalUrl = recordedVideoUrl;
      const mins = Math.max(1, Math.ceil(recordingSeconds / 60));
      durationText = `${mins} min`;
    } else if (activeTab === 'upload' && uploadedPreviewUrl) {
      finalUrl = uploadedPreviewUrl;
      durationText = '10 min';
    }

    if (finalUrl) {
      onVideoReady(finalUrl, durationText);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
        
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5C4DF5] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Créer & Enregistrer une vidéo
              </h2>
              <p className="text-[11px] text-gray-500">
                Filmez directement votre leçon ou importez une vidéo depuis votre appareil
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Choix d'onglet : Filmer ou Importer */}
        <div className="flex px-5 pt-3 gap-2 bg-gray-50 border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              setActiveTab('record');
              startCamera();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'record'
                ? 'border-[#5C4DF5] text-[#5C4DF5] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Studio vidéo en direct</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#5C4DF5] text-[#5C4DF5] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Importer un fichier</span>
          </button>
        </div>

        {/* Corps du modal */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1 : ENREGISTREUR VIDÉO EN DIRECT */}
          {activeTab === 'record' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">Accès caméra indisponible</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">{cameraError}</p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Réessayer
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Importer un fichier vidéo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Écran vidéo (Live ou Preview enregistrée) */}
                  <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    {recordingStatus !== 'stopped' ? (
                      <video
                        ref={videoLiveRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    ) : (
                      recordedVideoUrl && (
                        <video
                          src={recordedVideoUrl}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      )
                    )}

                    {/* Badge d'enregistrement en cours */}
                    {recordingStatus === 'recording' && (
                      <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full flex items-center gap-2 text-xs font-bold shadow-md animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>REC {formatTimer(recordingSeconds)}</span>
                      </div>
                    )}

                    {/* Contrôles overlay sur le live */}
                    {recordingStatus !== 'stopped' && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-white">
                        <button
                          type="button"
                          onClick={toggleVideo}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                          title={isVideoEnabled ? 'Couper caméra' : 'Activer caméra'}
                        >
                          {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={toggleAudio}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                          title={isAudioEnabled ? 'Couper micro' : 'Activer micro'}
                        >
                          {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-400" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action de l'enregistreur */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {recordingStatus === 'idle' && (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-2xl transition-all shadow-md shadow-red-200 active:scale-95 cursor-pointer"
                      >
                        <span className="w-3 h-3 rounded-full bg-white" />
                        <span>Démarrer l'enregistrement</span>
                      </button>
                    )}

                    {recordingStatus === 'recording' && (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Terminer ({formatTimer(recordingSeconds)})</span>
                      </button>
                    )}

                    {recordingStatus === 'stopped' && (
                      <div className="flex items-center gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={handleResetRecording}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Recommencer une prise</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmVideo}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Valider cette vidéo ({formatTimer(recordingSeconds)})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2 : IMPORTER UN FICHIER VIDÉO */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!uploadedPreviewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#5C4DF5] rounded-3xl p-8 sm:p-10 text-center space-y-3 cursor-pointer bg-gray-50/50 hover:bg-purple-50/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-100/70 text-[#5C4DF5] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      Cliquez pour choisir un fichier vidéo
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Formats supportés : MP4, WebM, MOV (enregistré avec votre téléphone ou caméra)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    <video
                      src={uploadedPreviewUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-purple-50/60 border border-purple-100 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileVideo className="w-4 h-4 text-[#5C4DF5] shrink-0" />
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {uploadedFile?.name || 'Vidéo importée'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadedPreviewUrl(null);
                      }}
                      className="text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmVideo}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs sm:text-sm font-semibold py-3 px-5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider et utiliser cette vidéo</span>
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="text-xs bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#5C4DF5]" />
            Studio vidéo intégré SkillUp
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="hover:text-gray-600 cursor-pointer font-medium"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
