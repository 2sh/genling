#!/usr/bin/env python3
from genling import *

syllables = []

# First syllable of stem
segments = []

# Initial
phonemes = [
	Phoneme("_", 10),

	Phoneme("j", 1),
	Phoneme("h", 1),
	Phoneme("c", 1), # C
]
segments.append(Segment(phonemes))

# Medial
phonemes = [
	Phoneme("_", 20),

	Phoneme("t", 5),  # t
	Phoneme("tc", 2), # t_hC
	Phoneme("th", 5), # t_h
	Phoneme("tj", 2), # t_h_j

	Phoneme("d", 6),  # d
	Phoneme("dj", 2), # d_j

	Phoneme("k", 5),
	Phoneme("kc", 2),
	Phoneme("kh", 4),
	Phoneme("kj", 2),
	Phoneme("kT", 4), # k_hT

	Phoneme("g", 6),
	Phoneme("gc", 2),
	Phoneme("gj", 3),

	Phoneme("f", 5),
	Phoneme("fc", 2),
	Phoneme("fh", 3),
	Phoneme("fj", 3),

	Phoneme("v", 3),
	Phoneme("vj", 1),

	Phoneme("p", 4),
	Phoneme("pc", 2), # p_hC
	Phoneme("ph", 2), # p_h
	Phoneme("pj", 1), # p\j
	Phoneme("pf", 1), # p\f

	Phoneme("b", 6),
	Phoneme("bj", 2),

	Phoneme("h", 5),

	Phoneme("s", 5),  # S
	Phoneme("sh", 4), # S_h
	Phoneme("sj", 1), # S_h_j
	Phoneme("st", 2),
	Phoneme("sk", 2),
	Phoneme("sf", 2),
	Phoneme("sp", 1),
	Phoneme("sn", 3),
	Phoneme("sm", 4),

	Phoneme("T", 4),  # T
	Phoneme("Tj", 2), # T_j

	Phoneme("D", 5),  # D
	Phoneme("Dj", 2), # D_j

	Phoneme("l", 7),
	Phoneme("lc", 6), # K
	Phoneme("lh", 4),
	Phoneme("lj", 4),

	Phoneme("n", 6),
	Phoneme("nh", 5),
	Phoneme("nj", 3),

	Phoneme("m", 4),
	Phoneme("my", 2),

	Phoneme("j", 5),  # j

	Phoneme("r", 2),  # 4
	Phoneme("rh", 3),
	Phoneme("rj", 3)
]
segments.append(Segment(phonemes))

# Nucleus
phonemes = [
	Phoneme("a", 5),  # a
	Phoneme("A", 3),  # @
	Phoneme("i", 4),  # I
	Phoneme("ie", 2), # i
	Phoneme("u", 4),  # U
	Phoneme("e", 3),  # E
	Phoneme("o", 3),  # O
	Phoneme("ea", 2), # Ea
	Phoneme("oe", 2), # 9
	Phoneme("y", 2)  # Y
]
segments.append(Segment(phonemes))

# Coda
phonemes = [
	Phoneme("_", 22),

	Phoneme("n", 6),
	Phoneme("l", 4),
	Phoneme("x", 6), # repeater
	Phoneme("c", 1),
	Phoneme("h", 2),
	Phoneme("r", 3)
]
segments.append(Segment(phonemes))

syllables.append(Syllable(segments, position=1))


# Second syllable of stem
segments = []

# Initial
phonemes = [
	Phoneme("t", 4),
	Phoneme("tj", 2),

	Phoneme("d", 5),
	Phoneme("dj", 1),

	Phoneme("k", 4),
	Phoneme("kj", 3),

	Phoneme("g", 6),
	Phoneme("gj", 1),

	Phoneme("f", 4),
	Phoneme("fj", 2),

	Phoneme("p", 4),
	Phoneme("pj", 1),

	Phoneme("b", 4),
	Phoneme("bj", 1),

	Phoneme("s", 5),
	Phoneme("sj", 2),

	Phoneme("T", 4),
	Phoneme("Tj", 1),

	Phoneme("D", 3),
	Phoneme("Dj", 1),

	Phoneme("l", 7),
	Phoneme("lc", 2),
	Phoneme("lj", 3),

	Phoneme("n", 8),
	Phoneme("nj", 3),

	Phoneme("m", 6),
	Phoneme("mj", 3),

	Phoneme("j", 3),

	Phoneme("r", 2),
	Phoneme("rj", 1)
]
segments.append(Segment(phonemes))

# Nucleus
phonemes = [
	Phoneme("a", 5),
	Phoneme("A", 5),
	Phoneme("e", 3),
	Phoneme("o", 3)
]
segments.append(Segment(phonemes))

syllables.append(Syllable(segments, position=2))

filters = [
	SimpleFilter("x>"),
	SimpleFilter("h>"),
	SimpleFilter("c>"),

	SimpleFilter("n#m"),

	SimpleFilter("cs"),

	SimpleFilter("l#l"),
	SimpleFilter("r#r"),
	SimpleFilter("l#r"),
	SimpleFilter("x#r"),

	RegexFilter("<._") # Stem starting with an initial
]

syllable_balance = [5, 2]

stem = Stem(syllables, balance=syllable_balance, filters=filters,
	prefix="<", infix="#", suffix=">")

rep_pre = [
	SimpleReplace("_", "")
]

rep_writing_system = [
	SimpleReplace("A", "ı"),
	SimpleReplace("oe", "ø"),

	SimpleReplace("T", "þ"),
	SimpleReplace("D", "ð"),

	RegexReplace("x#(.)", "\\1\\1")
]

rep_helpers = [
	SimpleReplace("<", ""),
	SimpleReplace("#", ""),
	SimpleReplace(">", "")
]

import sys

amount = int(sys.argv[1]) if len(sys.argv) > 1 else 10
writing_system = sys.argv[2] if len(sys.argv) > 2 else None

if writing_system == "raw":
	word = Word()
elif writing_system == "rough":
	word = Word(rep_pre + rep_helpers)
else:
	word = Word(rep_pre + rep_writing_system + rep_helpers)

for i in range(amount):
	output = stem.generate()
	print(word.create(output))
