---
title: Complementarity Test with Unmeasured, Permanently Inaccessible Path Markers
date: 2026-09-28
unlisted: true
excerpt: >-
  What happens in a quantum eraser experiment if the which-path information is
  never measured? We launched the photons carrying it into space from the lab
  roof at UCSB and estimate 73-82% will propagate unmeasured forever.
  Launching had no effect, consistent with quantum theory.
social_image: /assets/complementarity/roof.jpg
image_alt: Rooftop photon launch enclosure at UCSB
---

What happens in a quantum eraser experiment if the which-path information is never measured?
We launched the photons carrying it into space from the lab roof at UCSB
and estimate 73-82% will propagate unmeasured forever.
Launching had no effect, consistent with quantum theory.

<figure class="post-photo">
  <a href="/assets/complementarity/roof.jpg">
    <img src="/assets/complementarity/roof.jpg"
      alt="Rooftop photon launch enclosure at UCSB"
      width="4284" height="5712">
  </a>
  <figcaption>Rooftop photon launch enclosure at UCSB.</figcaption>
</figure>

To our knowledge, no one had tested this unmeasured case.
In previous experiments, the which-path information that suppresses interference
was always recorded by a detector, an absorber, or the surrounding environment.

In our setup, the photons carrying that information traveled by fiber to the roof and were launched straight up through the small window in the top of the enclosure in the photo.
From there, their path runs through the atmosphere, the Milky Way, and into the intergalactic medium.
Our flat ΛCDM transmission model estimates that 73-82% will survive unmeasured indefinitely.
Their entangled twins stayed in the lab and went through an interferometer.

Launching the photons did not restore interference.
We alternated between launching the photons and measuring them instead.
Across 6.6 hours of integration and 100 million photon detections, we observed no statistically significant difference in the twins' unconditioned interference.

Quantum theory predicts this null result immediately, via the partial trace.
But prior experiments may have left the collapse-locality loophole open,
allowing their which-path measurements to causally influence the interference record.
For the perpetually unmeasured surviving photons, this is not possible.

As with loophole-closing Bell tests, the result is not surprising.
Our goal was to remove a physical assumption from a foundational test
of the partial trace itself.

The relation to the loophole, the causal geometry, our transmission model, and quantitative bounds are in the preprint:

[https://arxiv.org/abs/2609.25382](https://arxiv.org/abs/2609.25382)

Data and code:

[https://github.com/paul-gauthier/complementarity](https://github.com/paul-gauthier/complementarity)

Joint work with Sahil Patel, Sean Doan and Galan Moody in the [Quantum Photonics Lab at UCSB](https://qpl.ece.ucsb.edu).
Supported by the NSF Quantum Foundry and the UCSB NRT program.

### Experimental schematic and causal geometry

<figure class="post-figure">
  <a href="/assets/complementarity/fig-1.png">
    <img src="/assets/complementarity/fig-1.png"
      alt="Figure 1: Experimental schematic and causal geometry"
      width="1022" height="634">
  </a>
</figure>

Each polarization-entangled idler photon carries the only path marker for its
signal in the interferometer.
At the roof, a common path supports launching the idlers,
projecting them to erase the marker, or detecting them with the marker
preserved; three paths are drawn for clarity.
Pair creation encodes path information at 0 ns.
The idler is launched on an outgoing null
trajectory at ~300 ns and exits the past light cone
of the signal-detection event at ~425 ns.
The signal is detected at ~600 ns.
Our transmission model
of the launch optics, atmosphere, Milky Way, and intergalactic medium
predicts that
T<sub>∞</sub> ≈ 73–82%
of launched idlers will propagate unmeasured forever.

### Normalized launch-specific interference quadratures

<figure class="post-figure">
  <a href="/assets/complementarity/fig-4.png">
    <img src="/assets/complementarity/fig-4.png"
      alt="Figure 4: Normalized launch-specific interference quadratures"
      width="1020" height="496">
  </a>
</figure>

Cosine and sine quadratures of the launch-specific signal-singles interference
fringe for datasets D1-D6, each normalized by its dataset-specific
rate of path markers predicted to survive indefinitely.
All exclude the full-restoration unit circle
(η<sub>∞</sub> = 1).

### Where the photons are now

<figure class="post-video">
  <video controls muted playsinline preload="metadata" width="1920" height="1080"
    poster="/assets/complementarity/idler-photons-day-207.jpg"
    data-autoplay-in-view
    aria-label="Modeled propagation of the launched photons from UCSB into space">
    <source src="/assets/complementarity/idler-photons.mp4" type="video/mp4">
    <a href="/assets/complementarity/idler-photons.mp4">Download the photon propagation video</a>.
  </video>
</figure>

Most of the photons carrying the only which-path information are now 0.57 light-years away, crossing the Oort Cloud.

[View the interactive propagation model](https://paulg.info/complementarity-photons/)
