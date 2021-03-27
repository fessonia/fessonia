import FFmpegProgressEmitter from './ffmpeg_progress_emitter';

export = FFmpegError;

interface FFmpegError extends Error {
    /** the FFmpeg command string that was executed */
    cmd: string;
    /** the child process' exit code */
    code: number;
    /** the logs from FFmpeg, with FFmpeg times */
    log?: string;
    /** boolean, true if process was killed */
    killed?: boolean;
    name: 'FFmpegError';
    /** the progress emitter, if relevant */
    progress: FFmpegProgressEmitter | undefined;
    /** the signal that caused the process termination, if available */
    signal?: string;
}
