# open entrainer

A binaural beat generator in the browser. Two tones a few hertz apart, one in each ear, ramped along a curve you set, with pink noise underneath to cover the room. One HTML file, one stylesheet, one script, nothing else.

**Site**: [pajew-ski.github.io/open-entrainer](https://pajew-ski.github.io/open-entrainer/)

## How it works

The left ear gets the carrier minus half the beat, the right ear the carrier plus half the beat. With a 100 Hz carrier and a 4 Hz beat that is 98 Hz and 102 Hz. The brainstem constructs a pulse at the difference, and over minutes brainwave activity tends to drift toward it. This requires headphones; through speakers the two tones mix in the air and there is no beat.

A session has three phases: ramp in from a waking frequency to the target, hold at the target, ramp out to an end frequency. Transitions follow a logarithmic curve with cubic ease at both ends. Instead of typing durations you can set the clock time the session should end at, and the hold stretches to meet it.

The page draws the plan as a band around a center line, time running downward, with the brainwave band boundaries as faint vertical lines. While it plays, a horizontal line marks the current position and the corners show the live beat, band, and both ear frequencies.

Everything is generated while it plays. Nothing is downloaded, nothing is sent anywhere. The settings are kept in `localStorage`.

| Band | Beat | Typically |
| --- | --- | --- |
| Delta | below 4 Hz | deep sleep |
| Theta | 4 to 8 Hz | drowsiness, trance, the edge of sleep |
| Alpha | 8 to 13 Hz | relaxed wakefulness, eyes closed |
| Beta | 13 to 30 Hz | ordinary alert thinking |
| Gamma | above 30 Hz | focused attention |

## Using it

1. Put on stereo headphones and keep the volume low.
2. Pick a target beat. Around 4 to 6 Hz for sleep onset or a long lying meditation, 8 to 10 Hz for resting with eyes closed, 14 to 20 Hz for focused work.
3. Set the ramp in, hold, and ramp out in minutes, or set an end time and let the hold adjust.
4. Start, close your eyes, and let it run. Space starts and pauses. The session stops itself at the end.

## Before you use it

This is a self-help tool, not a medical device, and it does not treat anything. Do not use it while driving or operating anything that needs your attention. With epilepsy, a pacemaker, or a psychiatric condition, ask a clinician first. Stop if you feel unwell.

## Running it locally

```bash
git clone https://github.com/pajew-ski/open-entrainer.git
cd open-entrainer
open index.html
```

There is no build step and no dependency. Any static host serves it as is; on GitHub Pages, deploy from the root of `main`. The footer links adapt to a fork automatically.

Everything here was built by a coding agent from [AGENTS.md](AGENTS.md), which is the design and behavior spec of the tool.

## License

Public domain under the [Unlicense](LICENSE). Copy it, change it, sell it, build on it. Tools for the mind should be free.
