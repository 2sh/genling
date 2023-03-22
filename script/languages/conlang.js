import { Phoneme, Segment, Syllable, Stem, Word } from "../genling.js"


var P = (...args) => new Phoneme(...args);

var syllables = []

// First syllable of stem
var segments = []

// Inital
var phonemes = [
	P("_", 10),

	P("j", 1),
	P("h", 1),
	P("c", 1), // C
];
segments.push(new Segment(phonemes));

// Medial
var phonemes = [
	P("_", 20),

	P("t", 5),  // t
	P("tc", 2), // t_hC
	P("th", 5), // t_h
	P("tj", 2), // t_h_j

	P("d", 6),  // d
	P("dj", 2), // d_j

	P("k", 5),
	P("kc", 2),
	P("kh", 4),
	P("kj", 2),
	P("kT", 4), // k_hT

	P("g", 6),
	P("gc", 2),
	P("gj", 3),

	P("f", 5),
	P("fc", 2),
	P("fh", 3),
	P("fj", 3),

	P("v", 3),
	P("vj", 1),

	P("p", 4),
	P("pc", 2), // p_hC
	P("ph", 2), // p_h
	P("pj", 1), // p\j
	P("pf", 1), // p\f

	P("b", 6),
	P("bj", 2),

	P("h", 5),

	P("s", 5),  // S
	P("sh", 4), // S_h
	P("sj", 1), // S_h_j
	P("st", 2),
	P("sk", 2),
	P("sf", 2),
	P("sp", 1),
	P("sn", 3),
	P("sm", 4),

	P("T", 4),  // T
	P("Tj", 2), // T_j

	P("D", 5),  // D
	P("Dj", 2), // D_j

	P("l", 7),
	P("lc", 6), // K
	P("lh", 4),
	P("lj", 4),

	P("n", 6),
	P("nh", 5),
	P("nj", 3),

	P("m", 4),
	P("my", 2),

	P("j", 5),  // j

	P("r", 2),  // 4
	P("rh", 3),
	P("rj", 3)
];
segments.push(new Segment(phonemes));

// Nucleus
var phonemes = [
	P("a", 5),  // a
	P("A", 3),  // @
	P("i", 4),  // I
	P("ie", 2), // i
	P("u", 4),  // U
	P("e", 3),  // E
	P("o", 3),  // O
	P("ea", 2), // Ea
	P("oe", 2), // 9
	P("y", 2)   // Y
];
segments.push(new Segment(phonemes));

// Coda
var phonemes = [
	P("_", 22),

	P("n", 6),
	P("l", 4),
	P("x", 6), // repeater
	P("c", 1),
	P("h", 2),
	P("r", 3)
];
segments.push(new Segment(phonemes));

syllables.push(new Syllable(segments, {position: 0}));


// Second syllable of stem
var segments = []

// Inital
var phonemes = [
	P("t", 4),
	P("tj", 2),

	P("d", 5),
	P("dj", 1),

	P("k", 4),
	P("kj", 3),

	P("g", 6),
	P("gj", 1),

	P("f", 4),
	P("fj", 2),

	P("p", 4),
	P("pj", 1),

	P("b", 4),
	P("bj", 1),

	P("s", 5),
	P("sj", 2),

	P("T", 4),
	P("Tj", 1),

	P("D", 3),
	P("Dj", 1),

	P("l", 7),
	P("lc", 2),
	P("lj", 3),

	P("n", 8),
	P("nj", 3),

	P("m", 6),
	P("mj", 3),

	P("j", 3),

	P("r", 2),
	P("rj", 1)
];
segments.push(new Segment(phonemes));


// Nucleus
var phonemes = [
	P("a", 5),
	P("A", 5),
	P("e", 3),
	P("o", 3)
];
segments.push(new Segment(phonemes));

syllables.push(new Syllable(segments, {position: 1}));


var filters = [
	/x$/,
	/h$/,
	/c$/,

	/n#m/,

	/cs/,

	/([lr])#\1/, //repeat of l or r
	/[lx]#r/, // lr or xr
	
	/^._/ // Stem starting with an initial
];

var stem = new Stem(syllables, {
	"balance": [5, 2],
	"filters": filters,
	"infix": "#"
});


var reps = [
	[/_/g, ""],

	[/A/g, "ı"],
	[/oe/g, "ø"],

	[/T/g, "þ"],
	[/D/g, "ð"],

	[/x#(.)/g, "$1$1"],

	[/#/g, ""]
];


var latin = new Word(reps);

export default {
	name: "Conlang",
	stemObject: stem,
	scripts:
	[
		{
			name: "Latin",
			wordObject: latin
		}
	]
}
