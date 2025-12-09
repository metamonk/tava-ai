ALTER TABLE "therapy_sessions" ALTER COLUMN "transcript" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "therapy_sessions" ADD COLUMN "audio_file_path" text;