These five small, silent WebM clips were generated locally with a canvas and
MediaRecorder for automated media-gallery QA. They show a labelled synthetic
QA slate and moving rectangle, contain no third-party footage, and do not
represent property inventory. Only the test fixture API references them.

Clips are remuxed with FFmpeg from the Ubuntu archive so WebM duration/seeking
metadata is finite and compatible with native Android playback.

H.264 baseline MP4 variants are owned synthetic QA clips for AVFoundation-compatible tests. Durations: 0.7, 3, 6, 15 and 30 seconds; yuv420p, no audio, fast-start metadata. Repeated/looped synthetic footage is not genuine property media. Original WebM paths are retained.
