# GIF Beat Studio

Make beat-synced videos out of GIFs, in the style of a CapCut "auto beat" edit. It runs entirely in the browser:
nothing is uploaded and there's no server or build step.

## Run it

It's a static site, so serve the folder with any static server:

```bash
cd gif-beat-studio
python3 -m http.server 8000      # then open http://localhost:8000
```

Or deploy the folder to GitHub Pages, Netlify or Vercel. Use HTTPS, or `localhost`, for the full feature set.
Opening `index.html` straight from disk won't work, because ES modules need to be served over http(s).

Best in desktop Chrome or Edge. Safari 17+ and Firefox 130+ also work. Exports that can't use WebCodecs fall back to real-time recording.

## Tab 1: Library

- **+ Add GIFs**: bulk-import from
  - **Files**: pick or drag hundreds of GIFs at once, or a **.zip** of GIFs. Tick *"Use the folder name inside a .zip as the person's name"* and a zip laid out like `Name/clip1.gif` gets tagged automatically.
  - **GIPHY search**: paste a free API key from developers.giphy.com, search, then *Select all* → *Import*. Use *Load more* to page through results.
  - **Links**: paste direct `.gif` URLs, one per line.
  - Everything imported in one go can be tagged with a **name**, **gender** and **tags**. Duplicates are skipped automatically.
- **Browse**: filter by Female / Male / Untagged, by person (sidebar), or by searching names and tags. Sort by newest, oldest, name or **random** (⤮ reshuffles).
- **Tag**: click a GIF to edit it, or use **Select** to tag, delete or send many to the editor at once ("Fill clips").
- **Backup** (⋯): the library is stored in the browser's IndexedDB. Export it as a `.zip` (GIFs plus `library.json`) and import it on another device.

## Tab 2: Beat Editor

1. **Sound**: drop a TikTok sound or **video** (mp3/m4a/wav/mp4/mov…). The audio is extracted, and *Download audio* saves it as a WAV.
2. **Beats**: detected automatically.
   - **Beats** mode follows the tempo and cuts every ½, 1, 2 or 4 beats. For 2 and 4 it picks the strongest beats, roughly the downbeats.
   - **Hits** mode cuts on every strong hit, with a sensitivity slider.
   - Set **Start/End** to use only part of the sound.
   - Edit the cuts by hand: double-click to add one, drag to move it, `Delete` (or right-click) to remove it, ←/→ to nudge it. Press `B` during playback to tap cuts in time.
3. **Clips**: one clip per section between cuts (20 beats → about 20 clips). Tap a clip, then tap GIFs in the picker. Each pick fills the clip and moves on to the next one. You can also drag GIFs onto clips. **🎲 Fill empty** and **Shuffle all** fill clips at random from whatever the picker is filtered to (e.g. only "Female", or one person), avoiding repeats.
4. **Preview & export**: live preview with audio. Choose the format (9:16, 1:1, 4:5, 16:9), 720p/1080p, 30/60 fps, Fill (crop) or Fit (blurred background), and a cut effect (hard cut, zoom punch, flash). **Export video** renders an MP4 (H.264 + AAC, or Opus where AAC isn't available) faster than real time. Then *Download*, or *Share* on phones.

The current project (sound, cuts, clip choices and settings) is saved automatically and restored on reload.

## How the beat detection works (`js/beats.js`)

1. Decode the file with Web Audio, falling back to mediabunny's demuxer for odd containers. Mix it to mono at 22.05 kHz.
2. Build an onset-strength envelope: a 40-band mel spectrogram in dB with an 80 dB floor, then positive spectral flux, detrended and normalised. A bass-only (<200 Hz) flux is added on top so the cuts favour kicks and 808s.
3. Estimate the tempo by autocorrelating the envelope, weighted towards ~120 BPM, then refine it with parabolic interpolation.
4. Track the beats with dynamic programming (Ellis 2007, as in librosa). If the bass consistently lands half a beat away from the tracked beats, the tracker locked onto the off-beat, so the grid is shifted by half a beat.
5. Hits mode uses adaptive peak-picking on the same envelope.

On synthetic test loops at 100 and 128 BPM, cuts land within about 10 ms of the kick.

## Files

```
index.html          layout
css/app.css         styles (responsive; the picker becomes a bottom sheet on phones)
js/main.js          tabs, global drag & drop
js/library.js       Library tab, import (files/zip/GIPHY/links), tagging, backup
js/store.js         library state, filtering, de-duplication
js/db.js            IndexedDB storage
js/gif.js           GIF probing + decoding (ImageDecoder or gifuct-js) with an LRU frame cache
js/beats.js         audio extraction, beat/onset detection, WAV export
js/editor.js        Beat Editor tab: waveform, cuts, clips, picker, preview
js/render.js        draws one output frame (fit, blur background, effects)
js/export.js        MP4/WebM export via WebCodecs (mediabunny), MediaRecorder fallback
js/zip.js           tiny zip reader/writer
vendor/vendor.js    bundled mediabunny (MPL-2.0) + gifuct-js (MIT)
```

## A note on content

The app doesn't ship any GIFs: you build the library from GIFs you have, or from GIPHY's API. GIFs of real people taken from films and shoots are usually copyrighted, so keep that in mind before posting edits publicly.
