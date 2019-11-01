window.genlingLanguages.push((function()
{
var P=genling.Phoneme;

var segments = []

// Inital
var phonemes = [
	P("_",  16),
	P("k",  5),
	P("s", 4),
	P("t", 4),
	P("n", 4),
	P("h", 3),
	P("m", 1),
	P("y", 1),
	P("r", 1),
	P("w", 1),
	P("g", 1),
	P("z", 1),
	P("d", 1),
	P("b", 1),
	P("p", 1)
];
segments.push(genling.Segment(phonemes));

// Medial
var phonemes = [
	P("_", 20),
	P("y", 1)
];
segments.push(genling.Segment(phonemes));

// Nucleus
var phonemes = [
	P("a", 5),
	P("i", 4),
	P("u", 4),
	P("e", 3),
	P("o", 3)
];
segments.push(genling.Segment(phonemes));

// Coda
var phonemes = [
	P("_", 15),

	P("n", 9),
	P("x", 3)
];
segments.push(genling.Segment(phonemes));

var syllables = [genling.Syllable(segments, {prefix: "<", suffix: ">"})];

var filters = [
	/_y/,
	/x>$/,
	
	function(s){return /n><_/.test(s) && Math.random() > 0.9},
	
	/^<d_[ui]/,
	function(s){return /d_[iu]/.test(s) && Math.random() > 0.9},
	function(s){return /my[au]/.test(s) && Math.random() > 0.95},
	
	/y_?[yie]/,
	/w_?[yiueo]/,
	
	function(s){return /n><.y/.test(s) && Math.random() > 0.1},
	/x><.y/,
	/x><[^kstpc]/,
];

var stem = genling.Stem(syllables, {
	"balance": [2, 12, 8, 2, 1],
	"filters": filters
});

var repshelpers = [
	[/[<>]/g, ""],
]

var hiraganaMapping = {
	"<ya": "や",
	"<yu": "ゆ",
	"<yo": "よ",

	"<ka": "か",
	"<ki": "き",
	"<ku": "く",
	"<ke": "け",
	"<ko": "こ",

	"<sa": "さ",
	"<si": "し",
	"<su": "す",
	"<se": "せ",
	"<so": "そ",

	"<ta": "た",
	"<ti": "ち",
	"<tu": "つ",
	"<te": "て",
	"<to": "と",

	"<na": "な",
	"<ni": "に",
	"<nu": "ぬ",
	"<ne": "ね",
	"<no": "の",

	"<ha": "は",
	"<hi": "ひ",
	"<hu": "ふ",
	"<he": "へ",
	"<ho": "ほ",

	"<ma": "ま",
	"<mi": "み",
	"<mu": "む",
	"<me": "め",
	"<mo": "も",

	"<ra": "ら",
	"<ri": "り",
	"<ru": "る",
	"<re": "れ",
	"<ro": "ろ",

	"<wa": "わ",
	"<wo": "を",

	"<ga": "が",
	"<gi": "ぎ",
	"<gu": "ぐ",
	"<ge": "げ",
	"<go": "ご",

	"<za": "ざ",
	"<zi": "じ",
	"<zu": "ず",
	"<ze": "ぜ",
	"<zo": "ぞ",

	"<da": "だ",
	"<di": "ぢ",
	"<du": "づ",
	"<de": "で",
	"<do": "ど",

	"<ba": "ば",
	"<bi": "び",
	"<bu": "ぶ",
	"<be": "べ",
	"<bo": "ぼ",

	"<pa": "ぱ",
	"<pi": "ぴ",
	"<pu": "ぷ",
	"<pe": "ぺ",
	"<po": "ぽ",

	"<a": "あ",
	"<i": "い",
	"<u": "う",
	"<e": "え",
	"<o": "お"
};

var repsHiragana = [
	[/_/g, ""],
	[/([^<])ya/g, "$1iゃ"],
	[/([^<])yu/g, "$1iゅ"],
	[/([^<])yo/g, "$1iょ"],
	[/<.?[aiueo]/g, function(g){return hiraganaMapping[g];}],
	[/n>/g, "ん"],
	[/x>/g, "っ"]
];

var repsHepburn = [
	[/n><_/g, "n'"],
	[/n><y/g, "n'y"],
	
	[/_/g, ""],
	
	[/si/g, "shi"],
	[/sy/g, "sh"],
	[/ti/g, "chi"],
	[/tu/g, "tsu"],
	[/hu/g, "fu"],
	[/ty/g, "ch"],
	[/zi/g, "ji"],
	[/zy/g, "j"],
	[/di/g, "ji"],
	[/du/g, "ju"],
	[/x><ch/g, "cch"],
	[/x><(.)/g, "$1$1"],
	
	[/a><a/g, "ā"],
	[/i><i/g, "ī"],
	[/u><u/g, "ū"],
	[/e><[ei]/g, "ē"],
	[/o><[ou]/g, "ō"],
];

var repsNihon = [
	[/n><_/g, "n'"],
	[/n><y/g, "n'y"],
	
	[/_/g, ""],
	
	[/x><(.)/g, "$1$1"],
];

var repsKunrei = [
	[/n><_/g, "n'"],
	[/n><y/g, "n'y"],
	
	[/_/g, ""],
	
	[/di/g, "zi"],
	[/du/g, "zu"],
	[/dy/g, "zy"],
	
	[/x><(.)/g, "$1$1"],
];


var hiragana = genling.Word(repsHiragana.concat(repshelpers));
var hepburn = genling.Word(repsHepburn.concat(repshelpers));
var nihon = genling.Word(repsNihon.concat(repshelpers));
var kunrei = genling.Word(repsKunrei.concat(repshelpers));

return {
	name: "Japanese",
	stemObject: stem,
	scripts:
	[
		{
			name: "Hiragana",
			wordObject: hiragana
		},
		{
			name: "Hepburn",
			wordObject: hepburn
		},
		{
			name: "Nihon-shiki",
			wordObject: nihon
		},
		{
			name: "Kunrei-shiki",
			wordObject: kunrei
		}
	]
};

})());