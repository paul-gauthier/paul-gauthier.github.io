---
title: Dockerized libRadtran and SMARTS for radiative transfer
date: 2026-04-08
---

Researchers have sent entangled single photons over very long distances to
conduct some impressive experiments,
typically to explore the non-local nature of quantum mechanics.
The world's biggest
[delayed-choice quantum eraser experiment](https://arstechnica.com/science/2013/01/quantum-measurements-on-one-island-determine-behavior-on-another/)
{% cite Ma_2013 %}
sent entangled photons 144 km between two of the Canary Islands.
While a
[delayed-choice experiment](https://quantumfuture.dei.unipd.it/2017/04/28/extending-wheelers-delayed-choice-experiment-to-space/) sent entangled photons to LEO and back.
{% cite Vedovato2017SpaceDelayedChoice %}.

<figure style="float: right; max-width: 40%; margin: 0 0 1em 1em;">
  <img src="/assets/space-beamsplitter.jpg"
    alt="Delayed-choice experiment between Earth and a satellite"
    style="width: 100%;">
  <figcaption style="font-size: 0.85em; text-align: center;">
  Extending Wheeler's delayed-choice experiment to Space.
  {% cite Vedovato2017SpaceDelayedChoice %}
</figcaption>
</figure>

### Atmospheric transmission

There are multiple forms of analysis required to build out a link budget
for such an effort.
One important component is the fraction of your photons that will scatter or be absorbed
in the atmosphere.
I've recently been doing this sort of analysis, and tried it a few ways.
It's relatively easy to get a rough transmission estimate by
building an ad-hoc model of the effects of Rayleigh scattering,
the aerosol and molecular content of the air (water, oxygen), clouds, etc.

### Radiative transfer tools

A more reliable and comprehensive approach is to use an existing 
software package designed to model
radiative transfer.
This has the advantage of being well researched and battle-tested
by academic or commercial authors with deep knowledge.

The most noteworthy relevant tools are:

- [MODTRAN](https://modtran.spectral.com/) — A commercial radiative transfer model widely used in industry and
government for transmission, emission, and scattering calculations. {% cite Berk2014MODTRAN6 %}
- [libRadtran](https://www.libradtran.org/) — A more flexible, general-purpose open-source toolkit for atmospheric
radiative transfer calculations. {% cite Mayer2005libRadtran Emde2016libRadtran %}
- [SMARTS](https://www.nrel.gov/grid/solar-resource/smarts) — A fast clear-sky radiative transfer model focused on
spectral irradiance at Earth’s surface. {% cite Gueymard1995SMARTS2 %}

### Docker images

MODTRAN is a commercial package, while
libRadtran and SMARTS
are freely available.
The free tools are both based on FORTRAN scientific code bases,
and aren't what you might call "easy to install".

I spent a few hours bashing them into Docker containers and published
the recipes to GitHub.
Hopefully this saves others some time and frustration in the future.

- [libRadtran-docker](https://github.com/paul-gauthier/libRadtran-docker)
- [smarts-docker](https://github.com/paul-gauthier/smarts-docker)


### References

{% bibliography --cited %}

