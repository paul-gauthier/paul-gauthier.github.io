---
title: Dockerized SMARTS and libRadtran for radiative transfer
date: 2026-04-08
---

Researchers have sent entangled single photons over very long distances to
conduct some impressive experiments,
typically involving the non-local nature of quantum mechanics.
The world's biggest
[delayed-choice quantum eraser experiment](https://arstechnica.com/science/2013/01/quantum-measurements-on-one-island-determine-behavior-on-another/)
{% cite Ma_2013 %}
sent entangled photons 144 km between two of the Canary Islands.
Another group
[sent entangled photons 1,200 km](https://www.sciencedaily.com/releases/2017/06/170615142831.htm)
back-and-forth between the Earth and a quantum satellite
{% cite yin2017satellitebasedentanglementdistribution1200 %}
Or mix both concepts together to get a
[delayed-choice experiment between Earth and a satellite](https://quantumfuture.dei.unipd.it/2017/04/28/extending-wheelers-delayed-choice-experiment-to-space/?utm_source=chatgpt.com)
{% cite Vedovato2017SpaceDelayedChoice %}.

There are multiple forms of analysis required to build out a link loss budget
for such an effort.
One important piece is determining what fraction of your photons will scatter or be absorbed
in the atmosphere.
I've recently been doing this sort of analysis, and tried it a few ways.
It's relatively easy to get a rough transmission estimate by
building an ad-hoc model of the effects of Rayleigh scattering,
the aerosol and molecular content of the air (water, oxygen), clouds, etc.

A more reliable and comprehensive approach is to use an existing 
software package designed to model
radiative transfer.
This has the advantage of being well researched and battle-tested
by academic or commercial authors with deep knowledge.

The most noteworthy relevant tools are:

- [SMARTS](https://www.nrel.gov/grid/solar-resource/smarts) — A fast radiative transfer model for simulating clear-sky solar spectral irradiance at Earth’s surface.
- [libRadtran](https://www.libradtran.org/) — An open-source library and toolkit for radiative transfer calculations in the atmosphere. {% cite Mayer2005libRadtran Emde2016libRadtran %}
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

