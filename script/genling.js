/**
 * Generatrum Linguarum
 *
 * @module genling
 */
var genling = (function()
{
'use strict';

function weightedChoice(choices)
{
	var sum = 0;
	for(var i=0; i<choices.length; i++)
	{
		sum += choices[i];
	}
	var r = Math.random() * sum;
	for(var i=0; i<choices.length; i++)
	{
		r -= choices[i];
		if(r < 0) return i;
	}
}

/**
 * A phoneme of a segment.
 *
 * @class
 * @memberof module:genling
 * @param {string} grapheme
 *   The graphical representation.
 * @param {number} [weight=1]
 *   The likelihood of being chosen as a segment of a syllable.
 */
function Phoneme(grapheme, weight)
{
	if(!(this instanceof Phoneme))
		return new Phoneme(grapheme, weight);
	this.grapheme = grapheme;
	this.weight = (typeof weight !== 'undefined') ?
		weight : 1;
}

/**
 * A segment within a syllable.
 *
 * @class
 * @memberof module:genling
 * @param {Array.<Phoneme>} phonemes
 *   The possible phonemes from which to generate a syllable segment.
 * @param {string} [prefix]
 *   The string added to the front of a generated segment.
 * @param {string} [suffix]
 *   The string added at the end of a generated segment.
 */
function Segment(phonemes, prefix, suffix)
{
	if(!(this instanceof Segment))
		return new Segment(phonemes, prefix, suffix);
	this.phonemes = phonemes;
	this.prefix = (typeof prefix !== 'undefined') ? prefix : "";
	this.suffix = (typeof suffix !== 'undefined') ? suffix : "";
}

/**
 * Generate a segment by choosing one of its phonemes.
 * Usually only called by the Syllable object.
 *
 * @method
 * @return {string}
 *   The generated segment.
 */
Segment.prototype.generate = function()
{
	var self = this;
	var weights = [];
	for(var i=0; i<self.phonemes.length; i++)
	{
		weights.push(self.phonemes[i].weight);
	}
	return self.prefix +
		self.phonemes[weightedChoice(weights)].grapheme +
		self.suffix;
};

/**
 * A syllable within a stem.
 *
 * @class
 * @memberof module:genling
 * @param {Array.<Segment>} segments
 *   The possible segments from which to generate a stem syllable.
 * @param {Object} [props]
 *   The syllable properties.
 * @param {number|Array.<number>} [props.position]
 *   The position of the syllable within a stem.
 * @param {number} [props.weight=0]
 *   The likelihood of being chosen as a syllable in a stem.
 * @param {string} [props.prefix]
 *   The string added to the front of a generated syllable.
 * @param {string} [props.suffix]
 *   The string added at the end of a generated syllable.
 * @param {string} [props.infix]
 *   The string inserted between generated segments.
 */
function Syllable(segments, props)
{
	if(!(this instanceof Syllable))
		return new Syllable(segments, props);
	this.segments = segments;
	props = (typeof props !== 'undefined') ? props : {};
	this.position = (typeof props.position !== 'undefined') ?
		props.position : null;
	this.weight = (typeof props.weight !== 'undefined') ?
		props.weight : 1;
	this.prefix = (typeof props.prefix !== 'undefined') ?
		props.prefix : "";
	this.suffix = (typeof props.suffix !== 'undefined') ?
		props.suffix : "";
	this.infix = (typeof props.infix !== 'undefined') ?
		props.infix : "";
}

/**
 * Check if this syllable is permitted in the stem's position.
 * Usually only called by the Stem object.
 *
 * @method
 * @param {number} i
 *   The position within the stem.
 * @param {number} length
 *   The number of syllables in the stem.
 * @return {boolean}
 *   If this syllable is permitted.
 */
Syllable.prototype.isPermittedPosition = function(i, length)
{
	var self = this;
	if(self.position == null) return true;
	if(typeof self.position === "number")
	{
		var pos = (self.position < 0 ?
			self.position + length : self.position);
		if(pos == i)
			return true;
	}
	else if(typeof self.position === "object")
	{
		var minpos = self.position[0] < 0 ?
			self.position[0] + length : self.position[0];
		var maxpos = self.position[1] < 0 ?
			self.position[1] + length : self.position[1];
		if(minpos <= i && i <= maxpos)
			return true;
	}
	return false;
};

/**
 * Generate a syllable by its segments.
 * Usually only called by the Stem object.
 *
 * @method
 * @return {string}
 *   The generated syllable.
 */
Syllable.prototype.generate = function()
{
	var self = this;
	var string = [];
	for(var i=0; i<self.segments.length; i++)
	{
		string.push(self.segments[i].generate());
	}
	return self.prefix + string.join(self.infix) + self.suffix;
};

/**
 * The stem of a word.
 *
 * @class
 * @memberof module:genling
 * @param {Array.<Syllable>} syllables
 *   The possible syllables from which to generate a word stem.
 * @param {Object} [props]
 *   The stem properties.
 * @param {Array.<number>} [props.balance=[1]]
 *     The balance of the amount of syllables in the generated stem
 * @param {Array.<function|RegExp>} [props.filters=[]]
 *   An array of functions and regex objects for filtering stems.
 *   A stem is rejected when a function returns true or a regex pattern
 *   matches the stem. The stem string to be filtered includes the
 *   prefix, suffix and infixes specified in this object.
 * @param {string} [props.prefix]
 *   The string added to the front of a generated stem.
 * @param {string} [props.suffix]
 *   The string added at the end of a generated stem.
 * @param {string} [props.infix]
 *   The string inserted between generated syllables.
 * @param {number} [props.retryCount=100]
 *   The maximum number of times to retry generating a stem that isn't rejected
 *   by the filters. An error is thrown on reaching the maximum number.
 */
function Stem(syllables, props)
{
	if(!(this instanceof Stem))
		return new Stem(syllables, props);
	this.syllables = syllables;
	props = (typeof props !== 'undefined') ? props : {};
	this.balance = (typeof props.balance !== 'undefined') ?
		props.balance : [1];
	this.filters = (typeof props.filters !== 'undefined') ?
		props.filters : [];
	this.prefix = (typeof props.prefix !== 'undefined') ?
		props.prefix : "";
	this.suffix = (typeof props.suffix !== 'undefined') ?
		props.suffix : "";
	this.infix = (typeof props.infix !== 'undefined') ?
		props.infix : "";
	this.retryCount = (typeof props.retryCount !== 'undefined') ?
		props.retryCount : 1000;
}

function unfilteredGenerate()
{
	var self = this;
	var syllableAmount = weightedChoice(self.balance) + 1;
	var string = [];
	for(var i=0; i<syllableAmount; i++)
	{
		var syllables = [];
		var weights = [];
		for(var n=0; n<self.syllables.length; n++)
		{
			var syllable = self.syllables[n];
			if(!syllable.isPermittedPosition(i, syllableAmount)) continue;
			syllables.push(syllable);
			weights.push(syllable.weight);
		}
		var syllable = syllables[weightedChoice(weights)];
		string.push(syllable.generate());
	}
	return self.prefix + string.join(self.infix) + self.suffix;
};

/**
 * Generate a stem by its syllables.
 *
 * @method
 * @return {string}
 *   The generated stem.
 */
Stem.prototype.generate = function()
{
	var self = this;
	for(var i=0; i<self.retryCount; i++)
	{
		var stem = unfilteredGenerate.call(self);
		var isRejected = false;
		for(var f=0; f<self.filters.length; f++)
		{
			var filter = self.filters[f];
			if(typeof filter === "function")
			{
				isRejected = filter(stem);
			}
			else
			{
				filter.lastIndex = 0;
				isRejected = filter.test(stem);
			}
			if(isRejected) break;
		}
		if(!isRejected) return stem;
		
		var strTry = (i+1).toString();
		if(strTry.length < 2) strTry = "0" + strTry;
		console.debug("Rejection [%s] %s",
			strTry, stem,
			filter);
	}
	throw "Too many filter rejected stems";
};

/**
 * A word formed from a stem.
 * A Word object may represent an inflection such as a noun declension, verb
 * conjugation, derivation, etc. Finally, the replacements may also remove
 * the helper characters (prefixes, infixes and suffixes) and transliterate
 * the raw graphemes to the correct writing system.
 *
 * @class
 * @memberof module:genling
 * @param {Array<function|Array<RegExp,number>>} replacements
 *     An array of 
 */
function Word(replacements)
{
	if(!(this instanceof Word))
		return new Word(replacements);
	this.replacements = (typeof replacements !== 'undefined') ?
		replacements : [];
}

/**
 * Create a word from a stem
 *
 * @method
 * @param {string} stemString
 *   The stem string from which to create a word.
 * @return {string}
 *   The created word.
 */
Word.prototype.create = function(stemString)
{
	var self = this;
	var string = stemString;
	var replCount = 0;
	
	for(var i=0; i<self.replacements.length; i++)
	{
		var repl = self.replacements[i];
		if(typeof repl === "function")
			var newString = repl(string);
		else
			var newString = string.replace(repl[0], repl[1]);
		if(string != newString)
		{
			replCount++;
			var strReplCount = replCount.toString();
			if(strReplCount.length < 2) strReplCount = "0" + strReplCount;
			console.debug("Replacement [%s] %s => %s",
				strReplCount, stemString, newString,
				repl);
		}
		string = newString;
	}
	return string;
};

return {
	Phoneme: Phoneme,
	Segment: Segment,
	Syllable: Syllable,
	Stem: Stem,
	Word: Word
};
})();
