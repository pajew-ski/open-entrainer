# AGENTS.md

Public GitHub repo, project name **open-entrainer**. Content: a binaural beat generator in the browser. Two oscillators a beat apart, pink noise under them, a three phase plan for the beat, and a canvas that draws the plan. It is a sibling of **open-desensitizer** and **open-helix** and shares its design with **temet-nosce**; the four should look and read as one family.

Target audience: someone who wants a beat for sleep, meditation, or focus without an app, an account, or a download. The page has to explain the mechanism in one read and expose every parameter without a settings menu.

## Non-Goals

- No framework, no build tool, no bundler, no package manager
- No second file. The app is `index.html` alone; stylesheet and script are inline so one file can be copied anywhere and run
- No external resource of any kind: no CDN, no web font, no analytics
- No accounts, no network requests, no data leaving the page
- No manual dark/light toggle. Automatic only, via `prefers-color-scheme`
- No manual language switch. Automatic only, via the browser's language, with a URL override
- No color. The design is achromatic; brainwave bands are named, never colored
- No modal, no collapsible settings panel. Everything is on the page

## Repo Structure

```
/
├── AGENTS.md
├── README.md            (short: what this is, link to the Pages site)
├── LICENSE              (Unlicense)
└── index.html           (the whole app: page, stylesheet and script in one file)
```

GitHub Pages deploys from the root of `main`. The footer derives its GitHub links from the Pages URL, so a fork needs no edit.

## Design

The inline stylesheet begins with the token block from temet-nosce, verbatim. It stays verbatim in all projects of the family; a change to the tokens is a change to all of them.

- Color: oklch with chroma 0. Light: bg 98%, surface 94%, border 85%, text 15%, muted 40%. Dark flips the scale under `prefers-color-scheme: dark`. `color-scheme: light dark` on the root so form controls follow.
- Spacing: Fibonacci in pixels, 5 8 13 21 34 55 89 144, as `--space-1` to `--space-8`.
- Type: system-ui. Base 1rem, line-height 1.618, sizes 0.875rem, 1rem, φ, φ², φ³.
- Layout: a `.shell` of 987px max width with 21px side padding. Hero, sections, footer. Text columns cap at 42rem.
- Map: a golden rectangle (aspect ratio φ, max height 610px) on the surface color with a border. Readouts sit in its top corners as HUD text: label in small caps, value at φ size, detail in muted small text.
- Settings: three bordered panels, Timing, Beat, Mix, in an auto-fit grid that wraps to one column below 233px per panel. Native inputs with `accent-color` set to the text color.
- Buttons: bordered, transparent. The primary button is inverted (text-colored surface, background-colored label). Nothing is colored, nothing glows.

## Behavior

- Plan: ramp in, hold, ramp out in whole minutes (defaults 12, 42, 6). Beat start, target, end in Hz (defaults 40, 4.4, 10; range 0.5 to 40). Carrier 60 to 400 Hz (default 100). Tone volume 0 to 100% (default 80), pink noise 0 to 50% (default 3). Persisted in `localStorage` under `open-entrainer`.
- Curve: within a ramp the beat is `a · (b / a)^ease(t)` with `ease` the cubic in-out. Frequencies below 0.1 Hz are clamped before the ratio.
- End time: a time input shows the clock time the session would finish if started now. Editing it sets the hold to the minutes until that time minus ramp in and ramp out, at least one minute. A time earlier than now means tomorrow.
- Audio: one `AudioContext` created on Start. Left oscillator at carrier minus half the beat, right at carrier plus half, each through its own gain into a two channel merger. Pink noise from a five second looping buffer generated with Paul Kellet's filter, one gain node, fed to both channels. Tone gain is volume times 0.5, noise gain is volume times 0.25, both applied with `setTargetAtTime` and a 0.1 s constant. Frequencies follow the plan with a 0.05 s constant. Stop ramps all gains to zero over 0.3 s, then closes the context. On Start and Resume the page claims the playback audio session so the iOS silent switch does not mute the speaker: `navigator.audioSession.type = "playback"` where it exists, otherwise a looping one second silent WAV, built in the script as a Blob URL, plays in an `Audio` element; Pause and Stop pause it.
- Transport: Start, Pause, Stop buttons; Pause suspends the context, Resume resumes it, Stop resets to zero. Space starts or pauses unless a form control has focus. The session stops itself at the end and the state reads Finished.
- Map: time top to bottom. The beat is drawn as a band of border color between the two tone frequencies, edged in text color, centered on the carrier. Brainwave band boundaries (4, 8, 13, 30 Hz) are faint vertical lines mirrored around the center, labelled in hertz along the bottom edge on the right side. Phase boundaries are dashed horizontal lines. While playing or paused, a horizontal line in text color marks the current position. The canvas reads its colors from its own computed style (background, color, border color, outline color) so it follows the color scheme without a second palette. Device pixel ratio is respected. Redrawn on input, resize, theme change, and every frame while playing.
- Readouts: State (Ready, Running, Paused, Finished) and elapsed over total. Band name and beat to one decimal, left and right frequency to one decimal.

## Language

The page ships in English and German in the same file. A small classic script in the head sets `<html lang>` before the first paint: German when the browser's first language starts with `de`, English otherwise; `?lang=de` or `?lang=en` overrides. Without script the page stays English.

- Prose in the markup exists once per language, as sibling elements with `lang="en"` and `lang="de"`. One CSS rule hides every element whose `lang` does not match the root. Short labels follow the same pattern with sibling spans.
- Strings the script writes live in a small table `T` with one entry per language. Numbers use a decimal point in English and a decimal comma in German.

## Copy

Plain sentences, present tense, no exclamation marks, no emoji, no em dashes, in both languages. The German avoids direct address where an infinitive does the job. Explain the mechanism, name the bands, say what the tool does not do. Warnings are stated once in a section of their own. Product names are lowercase in headings and the footer, as in temet-nosce. README, AGENTS.md and commit messages are English.

## Files

### `index.html`

One file with four parts: the language script and the `<style>` block in the head, the markup, and one `<script type="module">` at the end of the body (plus the small footer module before it).

Markup: hero with the project name and one sentence. Sections: How it works (with the band table), Session (map, transport, three panels), Using it, Before you use it. Footer with the AGENTS.md and source links and the module that rewrites them from the Pages URL.

Style block: token block, base rules (hero, sections, tables, controls, buttons, footer), then the map, HUD, panels and fields.

Script block: an ES module. No globals beyond what the DOM gives. Sections: plan (easeInOutCubic, glide, beatAt, bandOf), settings (load, save, readPlan, render, renderClock, renderBeat, showEndTime, applyEndTime, update), audio (pinkNoiseBuffer, silentWav, claimPlayback, releasePlayback, startAudio, stopAudio, applyVolumes, setFrequencies), transport (setState, play, pause, stop, loop), map (colors, resize, draw), and the event wiring at the bottom.
