#!/usr/bin/env python
"""Vocal tier, stage 2: put a target timbre on a sung wav with RVC.

    vendor/vocal/env/bin/python scripts/vocal-convert.py in.wav out.wav
        [--model vendor/vocal/rvc-models/infamous_miku_v2/infamous_miku_v2.pth]
        [--index <.index>] [--pitch 0] [--index-rate 0.66] [--protect 0.33]
        [--f0 rmvpe+]

RVC replaces TIMBRE only: the input's pitch contour, timing, vowels and
expression come through unchanged (with --pitch as a semitone transposition).
The input therefore has to already be singing — that is what stage 1 is for.
Uses infer_rvc_python (MIT), which loads the HuBERT/ContentVec encoder and the
RMVPE pitch extractor from Hugging Face on first run and caches them.
"""
import argparse, os, sys, time, json
here = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(here, '..'))
ap = argparse.ArgumentParser()
ap.add_argument('inp'); ap.add_argument('out')
ap.add_argument('--model', default=os.path.join(ROOT, 'vendor/vocal/rvc-models/infamous_miku_v2/infamous_miku_v2.pth'))
ap.add_argument('--index', default=None)
ap.add_argument('--pitch', type=int, default=0)
ap.add_argument('--index-rate', type=float, default=0.66)
ap.add_argument('--protect', type=float, default=0.33)
ap.add_argument('--envelope', type=float, default=0.25)
ap.add_argument('--f0', default='rmvpe+')
ap.add_argument('--cpu', action='store_true')
args = ap.parse_args()

if args.index is None:
    d = os.path.dirname(args.model)
    idx = [f for f in os.listdir(d) if f.endswith('.index')]
    args.index = os.path.join(d, idx[0]) if idx else None

import soundfile as sf
from infer_rvc_python import BaseLoader

t0 = time.time()
conv = BaseLoader(only_cpu=args.cpu)
conv.apply_conf(
    tag='vocal', file_model=args.model, pitch_algo=args.f0, pitch_lvl=args.pitch,
    file_index=args.index, index_influence=args.index_rate,
    respiration_median_filtering=3, envelope_ratio=args.envelope,
    consonant_breath_protection=args.protect,
)
audio, sr = conv.generate_from_cache(audio_data=args.inp, tag='vocal')
sf.write(args.out, audio, sr, subtype='PCM_16')
conv.unload_models()
info = {'model': os.path.basename(args.model), 'index': os.path.basename(args.index) if args.index else None,
        'pitch': args.pitch, 'f0': args.f0, 'index_rate': args.index_rate, 'protect': args.protect,
        'sr': int(sr), 'seconds': len(audio) / sr, 'convert_s': time.time() - t0}
with open(os.path.splitext(args.out)[0] + '.rvc.json', 'w') as f: json.dump(info, f, indent=1)
print(f'wrote {args.out} ({len(audio) / sr:.1f}s @ {sr} Hz, {time.time() - t0:.0f}s)', file=sys.stderr)
