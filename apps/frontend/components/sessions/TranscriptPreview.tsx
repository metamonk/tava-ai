'use client';

interface TranscriptPreviewProps {
  transcript?: string;
  audioFilePath?: string;
}

export default function TranscriptPreview({ transcript, audioFilePath }: TranscriptPreviewProps) {
  const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = transcript ? transcript.length : 0;

  if (!transcript && !audioFilePath) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">No transcript available</p>
      </div>
    );
  }

  if (audioFilePath && !transcript) {
    return (
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-800">Audio Uploaded</h3>
            <p className="text-sm text-amber-700 mt-1">
              Transcription is pending. The audio file will be processed shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">Session Transcript</h3>
        </div>
        <div className="text-xs text-gray-500">
          {wordCount.toLocaleString()} words &middot; {charCount.toLocaleString()} characters
        </div>
      </div>
      <div className="p-6">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{transcript}</p>
        </div>
      </div>
    </div>
  );
}
