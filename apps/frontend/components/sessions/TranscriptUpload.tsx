'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Button, LoadingSpinner } from '@/components/ui';

interface TranscriptUploadProps {
  sessionId: string;
  onUploadComplete: () => void;
}

type UploadType = 'text' | 'audio';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function TranscriptUpload({ sessionId, onUploadComplete }: TranscriptUploadProps) {
  const [uploadType, setUploadType] = useState<UploadType>('text');
  const [transcriptText, setTranscriptText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 25MB limit');
        setAudioFile(null);
        return;
      }
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (uploadType === 'text') {
        if (!transcriptText.trim()) {
          setError('Please enter transcript text');
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/transcript`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcriptText.trim() }),
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save transcript');
        }

        setSuccess('Transcript saved successfully');
        setTranscriptText('');
      } else {
        if (!audioFile) {
          setError('Please select an audio file');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('audio', audioFile);

        const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/audio`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to upload audio');
        }

        setSuccess('Audio uploaded successfully. Transcription will be processed separately.');
        setAudioFile(null);
      }

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#161a1d] p-6 rounded-xl shadow-md dark:shadow-none dark:border dark:border-[#2a2f35]">
      <h2 className="text-xl font-semibold mb-4 text-[#1a1d21] dark:text-[#f5f3ef]">
        Upload Transcript
      </h2>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setUploadType('text')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadType === 'text'
              ? 'bg-[#c4907a] text-white dark:bg-[#d4a08a]'
              : 'bg-[#e8e6e1] dark:bg-[#1a1d21] text-[#3d4449] dark:text-[#d1d5db] hover:bg-[#d1d5db] dark:hover:bg-[#2a2f35]'
          }`}
        >
          Text Transcript
        </button>
        <button
          type="button"
          onClick={() => setUploadType('audio')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadType === 'audio'
              ? 'bg-[#c4907a] text-white dark:bg-[#d4a08a]'
              : 'bg-[#e8e6e1] dark:bg-[#1a1d21] text-[#3d4449] dark:text-[#d1d5db] hover:bg-[#d1d5db] dark:hover:bg-[#2a2f35]'
          }`}
        >
          Audio File
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadType === 'text' ? (
          <div>
            <label
              htmlFor="transcript"
              className="block text-sm font-medium text-[#3d4449] dark:text-[#d1d5db] mb-2"
            >
              Paste Transcript
            </label>
            <textarea
              id="transcript"
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full px-3 py-2 border border-[#e8e6e1] dark:border-[#2a2f35] rounded-lg shadow-sm bg-white dark:bg-[#1a1d21] text-[#1a1d21] dark:text-[#f5f3ef] placeholder-[#6b7280] dark:placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c4907a] focus:border-[#c4907a] h-64 resize-y"
              placeholder="Paste session transcript here..."
              required
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="audio"
              className="block text-sm font-medium text-[#3d4449] dark:text-[#d1d5db] mb-2"
            >
              Audio File (Max 25MB)
            </label>
            <input
              type="file"
              id="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full text-sm text-[#6b7280] dark:text-[#9ca3af] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#c4907a]/10 file:text-[#c4907a] dark:file:bg-[#d4a08a]/10 dark:file:text-[#d4a08a] hover:file:bg-[#c4907a]/20 dark:hover:file:bg-[#d4a08a]/20"
              required
            />
            {audioFile && (
              <p className="mt-2 text-sm text-[#6b7280] dark:text-[#9ca3af]">
                Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            <p className="mt-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              Note: Transcription will be processed separately after upload.
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              {uploadType === 'text' ? 'Saving...' : 'Uploading...'}
            </span>
          ) : uploadType === 'text' ? (
            'Save Transcript'
          ) : (
            'Upload Audio'
          )}
        </Button>
      </form>
    </div>
  );
}
