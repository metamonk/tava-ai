'use client';

interface TranscriptSegment {
  speaker: 'therapist' | 'client';
  text: string;
  start: number;
  end: number;
}

interface DiarizedTranscript {
  segments: TranscriptSegment[];
  fullText: string;
}

interface TranscriptPreviewProps {
  transcript?: string;
  audioFilePath?: string;
}

function parseTranscript(transcript: string): DiarizedTranscript | null {
  try {
    const parsed = JSON.parse(transcript);
    if (parsed.segments && Array.isArray(parsed.segments)) {
      return parsed as DiarizedTranscript;
    }
    return null;
  } catch {
    return null;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TranscriptPreview({ transcript, audioFilePath }: TranscriptPreviewProps) {
  const diarized = transcript ? parseTranscript(transcript) : null;

  const wordCount = transcript
    ? (diarized ? diarized.fullText : transcript).trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = transcript ? (diarized ? diarized.fullText : transcript).length : 0;

  if (!transcript && !audioFilePath) {
    return (
      <div className="bg-[#faf8f5] dark:bg-[#1a1d21] p-6 rounded-xl border border-[#e8e6e1] dark:border-[#2a2f35]">
        <p className="text-[#6b7280] dark:text-[#9ca3af] text-center">No transcript available</p>
      </div>
    );
  }

  if (audioFilePath && !transcript) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800/30">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-amber-500 dark:text-amber-400"
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
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Audio Uploaded
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Transcription is pending. The audio file will be processed shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161a1d] rounded-xl shadow-md dark:shadow-none dark:border dark:border-[#2a2f35] overflow-hidden">
      <div className="px-6 py-4 bg-[#faf8f5] dark:bg-[#1a1d21] border-b border-[#e8e6e1] dark:border-[#2a2f35] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-green-500 dark:text-green-400"
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
          <h3 className="text-sm font-medium text-[#1a1d21] dark:text-[#f5f3ef]">
            Session Transcript
          </h3>
          {diarized && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              Speaker Labeled
            </span>
          )}
        </div>
        <div className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
          {wordCount.toLocaleString()} words &middot; {charCount.toLocaleString()} characters
        </div>
      </div>

      <div className="p-6">
        {diarized ? (
          <div className="space-y-4">
            {/* Speaker Legend */}
            <div className="flex gap-4 pb-4 border-b border-[#e8e6e1] dark:border-[#2a2f35]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">Therapist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-[#6b7280] dark:text-[#9ca3af]">Client</span>
              </div>
            </div>

            {/* Transcript Segments */}
            <div className="space-y-3">
              {diarized.segments.map((segment, index) => (
                <div key={index} className="flex gap-3">
                  {/* Speaker indicator */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        segment.speaker === 'therapist' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          segment.speaker === 'therapist'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {segment.speaker === 'therapist' ? 'Therapist' : 'Client'}
                      </span>
                      <span className="text-xs text-[#9ca3af] dark:text-[#6b7280]">
                        {formatTime(segment.start)}
                      </span>
                    </div>
                    <p className="text-[#3d4449] dark:text-[#d1d5db] leading-relaxed">
                      {segment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-[#3d4449] dark:text-[#d1d5db] leading-relaxed">
              {transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
