---
title: Tools for modeling atmospheric transmission
date: 2026-04-08
---

Researchers have sent entangled single photons over very long distances to
conduct some impressive experiments,
typically involving the non-local nature of quantum mechanics.
The world's biggest
[delayed-choice quantum eraser experiment](https://arstechnica.com/science/2013/01/quantum-measurements-on-one-island-determine-behavior-on-another/?utm_source=chatgpt.com)
{% cite Ma_2013 %}
sent entangled photons 1,200 km between two of the Canary Islands.
Another group
[sent entangled photons back-and-forth between the Earth and a quantum satellite](https://www.sciencedaily.com/releases/2017/06/170615142831.htm?utm_source=chatgpt.com).
{% cite yin2017satellitebasedentanglementdistribution1200 %}

There are multiple forms of analysis required to build out a link loss budget
for such an effort.
One important piece is determining out what fraction of your photons will scatter or be absorbed
in the atmosphere.
I've recently be trying to do this sort of analysis, and tried it a few ways.
It's relatively easy to get a rough transmission estimate by
building an ad-hoc transmission model of the effects of Rayleigh scattering,
the aerosol and molecular content of the air (water, Oxygen), clouds, etc.

A far more reliable approach is to use an existing 
software package designed to model
radiative transfer.
This has the advantage of being well researched and battle tested
by academic or commercial authors with deep knowledge.

The most noteworthy relevant tools are:

- [SMARTS](https://www.nrel.gov/grid/solar-resource/smarts) — A fast radiative transfer model for simulating clear-sky solar spectral irradiance at Earth’s surface.
- [libRadtran](https://www.libradtran.org/) — An open-source library and toolkit for radiative transfer calculations in the atmosphere.
- [MODTRAN](https://modtran.spectral.com/) — A widely used atmospheric radiative transfer model for simulating transmission, emission, and scattering across the spectrum.


MODTRAN is a commercial package, while
SMARTS and libRadtran are freely available.
The free tools are both based on FORTRAN scientific code bases,
and aren't what you might call "easy to install".

I spent a few hours bashing them into Docker containers and published
the recipes to GitHub.
Hopefully this saves others some time and frustration in the future.

- [smarts-docker](https://github.com/paul-gauthier/smarts-docker)
- [libRadtran-docker](https://github.com/paul-gauthier/libRadtran-docker)


### References

{% bibliography --cited %}

