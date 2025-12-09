'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Transcript</h2>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setUploadType('text')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            uploadType === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Text Transcript
        </button>
        <button
          type="button"
          onClick={() => setUploadType('audio')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            uploadType === 'audio'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Audio File
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadType === 'text' ? (
          <div>
            <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
              Paste Transcript
            </label>
            <textarea
              id="transcript"
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-64 resize-y"
              placeholder="Paste session transcript here..."
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
              Audio File (Max 25MB)
            </label>
            <input
              type="file"
              id="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {audioFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Note: Transcription will be processed separately after upload.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {uploadType === 'text' ? 'Saving...' : 'Uploading...'}
            </span>
          ) : uploadType === 'text' ? (
            'Save Transcript'
          ) : (
            'Upload Audio'
          )}
        </button>
      </form>
    </div>
  );
}
