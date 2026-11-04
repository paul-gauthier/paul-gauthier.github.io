---
title: Weight-space programming a neural quantum state
date: 2026-11-04
unlisted: true
excerpt: >-
  Working with Opus to diagnose and repair a neural quantum state's transfer from
  a 10×10 spin lattice to larger lattices, then fine-tune it to competitive energies.
social_image: /assets/quantum-weight-space/social.png
image_alt: Energy per site above the best published values at four lattice sizes, with WSP edits, fine-tuning, and one Lanczos step
---

I've been looking for an excuse to explore neural quantum states (NQS).
The recent MIT work on [weight-space programming](https://rikiyat.github.io/blog/weight-space-programming/) (WSP)
seemed like an interesting reason to dig in.

I worked with Opus to apply WSP techniques to an NQS trained on a 10×10 lattice of spins in the frustrated
J1-J2 model at J2/J1 = 0.5, a hard regime.
The goal was to transfer it to larger lattices up to 18×18.
A naive transfer attempt failed, and Opus
traced the failure to three size-dependent assumptions in the network's attention, output head, and phase.
Explicit repairs made the transfer work without training and provided a useful starting point for a short fine-tune.

Weight-space techniques alone got within about 2-4×10⁻³ per site of the best published energies I found for the larger
lattices, which is interesting but not really competitive.
Adding a few hundred steps of training and one standard trick (a Lanczos step) matched the best published energy at
14×14, and came within 5×10⁻⁵ per site of it at 18×18.

The project took about two days and a few hundred dollars of cloud GPU time.

AI disclosure: The whole point of this effort was to let AI try and do surgery on the network weights,
so Opus set the agenda for investigations and interventions and did all the work.
I supervised, made suggestions, authorized GPU spend, etc.
Below here, the writing is mostly Opus reporting its approach and the results;

![The three weight-space edits, and fine-tuning results at 14×14 and four lattice sizes](/assets/quantum-weight-space/figure.png)

*(a) The three edits to the 10×10 network. (b) How much less amplitude the network gives disordered
configurations than ordered ones, per site, with the original output head and with the edited one. (c) Energy per
site while fine-tuning at 14×14 from our edited network, a naive copy and random weights. The inset zooms in on our run
near the best published energy. (d) How far our energy per site is above the best published one at each lattice size,
with the edits alone, after fine-tuning, and after one Lanczos step.*

The base network is the Vision Transformer NQS released by Rende, Viteritti et al. (Commun. Phys. 2024).
It has about 435k
parameters, treats 2×2 patches of spins as tokens, and outputs the amplitude and phase of the wavefunction for a given
spin configuration. It was trained on the 10×10 lattice only.

Copying its weights onto a 14×14 lattice as is (adding the Marshall sign) gives an initial sampling estimate of about
−0.39 per site.
That's far from the best published 14×14 energy of −0.4967.
We read through the weights looking for parts that depend on lattice size and
found three.
Each got a hand-written replacement that leaves the network almost exactly as it was on 10×10.
The transfer rules require no additional training or newly fitted weights.

1. The attention heads mix patches using weights that depend only on the offset between them, and a bigger lattice has
offsets the network never saw. Heads that attend mostly to nearby patches get zero weight at the new offsets. The
other heads get their average weight spread across them.

2. The output head ends in a LayerNorm, which limits how large the log-amplitude can get regardless of lattice size. The
number of disordered spin configurations grows exponentially with size, so on big lattices they swamp the ordered
ones (panel b above). We replaced the single head with the original 10×10 head applied to every patch-aligned 10×10
window of the lattice, summed the results, and divided by 25.

3. On 10×10 the network's phase follows a simple rule to within about a milliradian: the Marshall sign, plus a sign flip
controlled by one hidden unit.
Opus was quite surprised to find this hidden unit.
On larger lattices the network's own phase drifts, so we wrote the rule in explicitly.
After the amplitude fix, this phase error was most of what was still getting worse as the lattice grew.

After applying these edits,
we then fine-tuned the edited network with ordinary VMC (MinSR).
The windowed implementation adds a separate head copy and mask arrays, which are updated during fine-tuning.
We gave the same 300-step training budget to a naive
copy of the 10×10 weights (with the Marshall sign) and to random weights (panel c above). Ours trained smoothly. The naive
copy's sampling never settled, so we can't assign it an energy, and training from scratch blew up.

Running our 14×14 fine-tune to 500 steps and adding one Lanczos step gave −0.49675(3). The best published 14×14 energy
is −0.49674, also a network plus one Lanczos step. Ours is 1.3×10⁻⁵ lower, which is 0.5σ, so it's a tie.

We ran the same recipe at the other sizes, with 300 training steps at 12×12 and 16×16 and 600 at 18×18.

<style>
.energy-results {
  max-width: 100%;
  margin: 1.5rem 0;
  overflow-x: auto;
}
.energy-results table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.energy-results th,
.energy-results td {
  padding: 0.5rem 0.875rem;
  text-align: right;
}
.energy-results th {
  border-bottom: 2px solid currentColor;
  line-height: 1.3;
  vertical-align: bottom;
}
.energy-results td {
  border-bottom: 1px solid rgba(127, 127, 127, 0.25);
  white-space: nowrap;
}
.energy-results th:first-child,
.energy-results td:first-child {
  text-align: left;
}
.energy-results th:nth-child(5),
.energy-results td:nth-child(5) {
  border-left: 1px solid rgba(127, 127, 127, 0.35);
}
</style>

<div class="energy-results" role="region" aria-label="Energy comparison by lattice size" tabindex="0" markdown="1">

| Lattice | Edits only | + fine-tuning | + Lanczos | Published best | Difference |
|---|---|---|---|---|---|
| 12×12 | −0.4956(1) | −0.49690(4) | −0.49702(2) | [−0.49722](https://doi.org/10.1038/s41567-024-02566-1) | +2.1×10⁻⁴ |
| 14×14 | −0.4940(1) | −0.49667(3) | −0.49675(3) | [−0.49674](https://doi.org/10.1088/2632-2153/acc56a) | −1.3×10⁻⁵ |
| 16×16 | −0.4930(1) | −0.49647(1) | −0.49651(2) | [−0.49691](https://arxiv.org/abs/2603.14425v1) | +4.0×10⁻⁴ |
| 18×18 | −0.4922(1) | −0.49637(3) | −0.49647(2) | [−0.49651](https://doi.org/10.1088/2632-2153/acc56a) | +4.4×10⁻⁵ |

</div>

*WSP edits only is the released network with the three edits and no training. The best published values come from a
ResNet (12×12, Chen & Heyl 2024) and a CNN (14×14 and 18×18, Liang et al. 2023), each plus one Lanczos step, and a
CNN-MPS with no Lanczos step (16×16, Fan et al. 2026). The 12×12 value is read off a figure in Chen & Heyl's paper.
The last column is our Lanczos result minus the best published value.*

### Observations

Reading the weights found problems quickly. The LayerNorm cap on the amplitude showed up in a
check that ran in about ten seconds on a CPU. The MIT article found that editing can remove an obstacle but can't add
a capability, and that matched what we saw. Editing the converged 10×10 network never improved it on 10×10, and the
gains all came from getting what it already knew to work on larger lattices.

The Lanczos step needed more care than we expected. The wavefunction has a node where one hidden unit's factor passes
through zero, and the Lanczos estimate is dominated by rare samples near it. Our first 14×14 estimate looked like a
clear record, and then single samples moved it by about 1×10⁻⁴ as more came in. Sampling from a guide that increases
probability near this node, then reweighting to the original wavefunction, gave a smaller gain that held steady as
samples were added.

Fine-tuning also levels off within about 300 steps at every lattice size: another 300 steps
gained only 4-8×10⁻⁵.

### Caveats

The 14×14 and 18×18 records are soft targets. Both come from a 2023 CNN plus a
Lanczos step. At 10×10, 12×12 and 16×16, where newer methods have been run, that CNN's energies are 2-3×10⁻⁴ above
the best published ones. At 12×12 and 16×16, where the records come from those newer methods, we're 2-4×10⁻⁴ short.

The fine-tuned states are in the right symmetry sector, with smooth correlations.
The correlations show no indication of Néel order over these sizes.
But the transfer leaves a pattern aligned with the 2×2 patches.
The bonds inside a patch come out a
little stronger than bonds between patches, where the true ground state has them all equal.
The states also pick up more spin contamination as the lattice grows. So they're fine for energies, but we wouldn't read
dimer or plaquette order off them.

The naive and scratch baselines only got the same short training budget as ours. They might do better with much more
training or other settings, which we didn't try.

The fine-tuning and the Lanczos step are standard methods.
We used WSP to create the starting point they ran from.
