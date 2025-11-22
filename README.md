# Open Entrainer

> **Ein Open-Source Binaural Beat Generator für Bewusstseinserforschung, Meditation und Deep Focus.**

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)
[![Status: Live](https://img.shields.io/badge/Status-Live_Demo-green)](https://pajew-ski.github.io/open-entrainer/)

**Open Entrainer** ist eine webbasierte Single-Page-Application (SPA), die präzise binaurale Frequenzen erzeugt, um Gehirnwellen in gewünschte Zustände zu führen (Brainwave Entrainment). Anders als starre MP3-Dateien generiert diese App die Töne in Echtzeit im Browser, erlaubt volle Kontrolle über die Frequenz-Topologie und nutzt stochastisches Rauschen zur psychoakustischen Maskierung.

 **Live Demo:** [https://pajew-ski.github.io/open-entrainer/](https://pajew-ski.github.io/open-entrainer/)

---

## Anwendungsbereiche

Dieses Tool ist mehr als nur eine Entspannungs-App. Durch die gezielte Manipulation der `Hold`-Phase und der Frequenzbereiche eignet es sich für verschiedene Bewusstseinstechniken:

### Meditation & Entspannung
Nutze Alpha- (8-13 Hz) oder Theta-Wellen (4-8 Hz), um den Geist schnell zu beruhigen, Stress abzubauen und tiefe meditative Zustände zu erreichen, ohne jahrelanges Training.

### Astralreisen & Außerkörperliche Erfahrungen (OBE)
Der Open Entrainer ist speziell darauf ausgelegt, den **"Mind Awake / Body Asleep"** Zustand zu unterstützen, der für Astralreisen (OBE) notwendig ist.
* **Empfehlung:** Setze die Ziel-Frequenz auf den unteren Theta-Bereich (ca. 4.5 Hz) oder oberen Delta-Bereich.
* **Technik:** Die `Ramp-In` Phase führt den Körper in den Schlaf, während die lange `Hold`-Phase den Geist an der Schwelle zum Traum wach hält. Dies begünstigt den Schwingungszustand und den Austritt.

### WBTB & Klarträumen (Lucid Dreaming)
Ideal für die **WBTB-Methode** (Wake Back To Bed). Stelle den Timer so ein, dass du während einer kurzen Wachphase in der Nacht in den Theta-Bereich geführt wirst, um bewusst in einen Traum einzusteigen (WILD-Technik).

### Deep Work & Fokus
Nutze Beta- (14-30 Hz) oder Gamma-Frequenzen (40 Hz+), um kognitive Leistung, Fokus und Problemlösefähigkeiten zu steigern (Biohacking).

### Quantum Jumping / Reality Shifting
Nutze das Tool, um eine tiefe Trance zu induzieren, die notwendig ist, um das kritische Bewusstsein zu umgehen und neue Intentionen im Unterbewusstsein zu verankern (Neuprogrammierung).

---

## Features

* **Volle Parametrisierung:** Kontrolle über Start-, Ziel- und End-Frequenzen sowie Trägerfrequenz (Base Carrier).
* **3-Phasen-Topologie:**
    1.  **Ramp In:** Sanftes Absenken der Gehirnwellen (Induktion).
    2.  **Hold:** Stabilisieren des Zielzustandes (z.B. für Astralprojektion oder Deep Meditation).
    3.  **Ramp Out:** Sicheres Zurückführen in den Wachzustand.
* **Organische Interpolation:** Frequenzübergänge erfolgen nicht linear, sondern über eine logaritmisch-sigmoidale Kurve, um physiologischen Widerstand zu minimieren.
* **Pink Noise Masking:** Eingebauter Generator für rosa Rauschen (1/f), um Umgebungsgeräusche auszublenden und die binauralen Töne psychoakustisch angenehmer zu machen.
* **Zielzeit-Automatik:** Gib an, wann deine Session beendet sein soll (z.B. 07:00 Uhr morgens), und der Algorithmus berechnet automatisch die perfekte Länge der `Hold`-Phase.
* **Privacy First / Sovereign Tech:** Die App läuft zu 100% lokal in deinem Browser (Client-Side). Keine Daten verlassen dein Gerät. Keine Tracker. Keine Werbung.

---

## Nutzung

1.  **Kopfhörer aufsetzen:** Binaurale Beats funktionieren physikalisch nur mit Stereo-Kopfhörern (ein Ton links, ein Ton rechts -> Gehirn erzeugt den Differenzton).
2.  **Konfiguration:** Klicke auf das Zahnrad.
    * Wähle deine Ziel-Frequenz (z.B. 4.4 Hz für tiefe Trance).
    * Stelle die Dauer der Phasen ein (In / Hold / Out).
3.  **Starten:** Klicke auf Play.
4.  **Augen schließen:** Lass dich von den Frequenzen führen.

---

## Installation (Lokal)

Da es sich um eine statische Web-App handelt, ist keine komplexe Installation nötig.

```bash
# Repository klonen
git clone [https://github.com/pajew-ski/open-entrainer.git](https://github.com/pajew-ski/open-entrainer.git)

# In das Verzeichnis wechseln
cd open-entrainer

# Die index.html einfach im Browser öffnen
open index.html
````

Alternativ kannst du es auf jedem statischen Webhoster (GitHub Pages, Vercel, Netlify) deployen.

-----

## Tech Stack

  * **HTML5 Canvas:** Für die Echtzeit-Visualisierung (Waterfall Plot).
  * **Web Audio API:** Für die präzise Oszillator-Generierung und das Audio-Mixing.
  * **Tailwind CSS:** Für das responsive UI und das Dark-Mode Styling.
  * **Vanilla JS:** Kein Framework-Overhead, maximale Performance.

-----

## Lizenz

Dieses Projekt ist unter der **Unlicense** veröffentlicht. Das bedeutet, es ist **Public Domain**.
Du kannst den Code kopieren, verändern, verkaufen oder als Basis für eigene (kommerzielle oder private) Projekte nutzen, ohne um Erlaubnis zu fragen.

Wissen und Werkzeuge zur Bewusstseinserweiterung sollten frei sein.

-----

Made with 🤍 in Regensburg.
