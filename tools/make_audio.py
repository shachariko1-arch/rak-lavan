#!/usr/bin/env python3
"""Generate the spoken-English audio packs in audio/ from js/data.js.

Usage:  pip install piper-tts   (and ffmpeg on PATH)
        python3 tools/make_audio.py path/to/voice.onnx

One pack per unit (audio/u1.json ...) maps each English word, sentence and
dialogue line to a base64 MP3. audio/words.json holds the single words used
by the sentence-building tiles. Re-run after adding lessons to js/data.js.
"""
import base64, io, json, os, re, subprocess, sys, wave
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf8').read()
voice = PiperVoice.load(sys.argv[1])
cfg = SynthesisConfig(length_scale=1.12)

def mp3(text):
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        voice.synthesize_wav(text, w, syn_config=cfg)
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-af', 'apad=pad_dur=0.12,loudnorm=I=-16:TP=-1.5',
                          '-ac', '1', '-ar', '22050', '-b:a', '32k', '-f', 'mp3', 'pipe:1'],
                         input=buf.getvalue(), stdout=subprocess.PIPE, check=True).stdout
    return base64.b64encode(out).decode()

def strings(block, key):
    m = re.search(key + r":\s*\[(.*?)\]\s*,\s*\n", block, re.S)
    return re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(1)) if m else []

os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
units = re.split(r"\n\s*id: '(u\d+)'", src)
tokens, total = set(), 0
for i in range(1, len(units), 2):
    uid, body = units[i], units[i + 1]
    texts = []
    for lesson in body.split("{ t: '")[1:]:
        for w in strings(lesson, 'w'): texts.append(w.split('|')[0])
        for s in strings(lesson, 's'): texts.append(s.split('|')[0])
        for d in strings(lesson, 'd'): texts.append(d.split('|')[1])
    texts = [t.replace("\\'", "'") for t in texts]
    pack = {}
    for t in dict.fromkeys(texts):
        pack[t] = mp3(t)
        for tok in re.sub(r'[.,!?;:"]', '', t).split(): tokens.add(tok)
    json.dump(pack, open(os.path.join(ROOT, 'audio', uid + '.json'), 'w', encoding='utf8'), ensure_ascii=False)
    total += len(pack); print(uid, len(pack), flush=True)
words = {t: mp3(t) for t in sorted(tokens)}
json.dump(words, open(os.path.join(ROOT, 'audio', 'words.json'), 'w', encoding='utf8'), ensure_ascii=False)
print('clips', total, 'words', len(words))
