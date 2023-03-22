/**
 * Generatrum Linguarum
 *
 * @module genling
 */

function weightedChoice(choices)
{
	const sum = choices.reduce((s, c) => s + c, 0)
	let r = Math.random() * sum
	return choices.findIndex(c => (r -= c) < 0)
}

/**
 * A phoneme of a segment.
 */
export class Phoneme
{
	/**
	 * @param {string} grapheme
	 *   The graphical representation.
	 * @param {number} [weight=1]
	 *   The likelihood of being chosen as a segment of a syllable.
	 */
	constructor(grapheme, weight)
	{
		if(!(this instanceof Phoneme))
			return new Phoneme(grapheme, weight)
		this.grapheme = grapheme
		this.weight = weight || 1
	}
}

/**
 * A segment within a syllable.
 */
export class Segment
{
	/**
	 * @param {Array.<Phoneme>} phonemes
	 *   The possible phonemes from which to generate a syllable segment.
	 * @param {string} [prefix]
	 *   The string added to the front of a generated segment.
	 * @param {string} [suffix]
	 *   The string added at the end of a generated segment.
	 */
	constructor(phonemes, prefix, suffix)
	{
		this.phonemes = phonemes
		this.prefix = prefix || ""
		this.suffix = suffix || ""
	}
	
	/**
	 * Generate a segment by choosing one of its phonemes.
	 * Usually only called by the Syllable object.
	 *
	 * @return {string}
	 *   The generated segment.
	 */
	generate()
	{
		return this.prefix
			+ this.phonemes[weightedChoice(this.phonemes.map(p => p.weight))].grapheme
			+ this.suffix
	}
}


/**
 * A syllable within a stem.
 */
export class Syllable
{
	/**
	 * A syllable within a stem.
	 *
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
	constructor(segments, props)
	{
		this.segments = segments
		props = props || {}
		this.position = props.position || null
		this.weight = props.weight || 1
		this.prefix = props.prefix || ""
		this.suffix = props.suffix || ""
		this.infix = props.infix || ""
	}
	
	/**
	 * Check if this syllable is permitted in the stem's position.
	 * Usually only called by the Stem object.
	 *
	 * @param {number} i
	 *   The position within the stem.
	 * @param {number} length
	 *   The number of syllables in the stem.
	 * @return {boolean}
	 *   If this syllable is permitted.
	 */
	isPermittedPosition(i, length)
	{
		if(this.position == null) return true
		if(typeof this.position === "number")
		{
			const pos = (this.position < 0 ?
				this.position + length : this.position)
			if(pos == i)
				return true
		}
		else if(typeof this.position === "object")
		{
			const minpos = this.position[0] < 0 ?
				this.position[0] + length : this.position[0]
			const maxpos = this.position[1] < 0 ?
				this.position[1] + length : this.position[1]
			if(minpos <= i && i <= maxpos)
				return true
		}
		return false
	}

	/**
	 * Generate a syllable by its segments.
	 * Usually only called by the Stem object.
	 *
	 * @return {string}
	 *   The generated syllable.
	 */
	generate()
	{
		return this.prefix
			+ this.segments.map(s => s.generate()).join(this.infix)
			+ this.suffix
	}
}

/**
 * The stem of a word.
 */
export class Stem
{
	/**
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
	constructor(syllables, props)
	{
		this.syllables = syllables
		props = props || {}
		this.balance = props.balance || [1]
		this.filters = props.filters || []
		this.prefix = props.prefix || ""
		this.suffix = props.suffix || ""
		this.infix = props.infix || ""
		this.retryCount = props.retryCount || 1000
	}
	
	#unfilteredGenerate()
	{
		const syllableAmount = weightedChoice(this.balance) + 1
		const string = Array.from({length: syllableAmount}, (_, i) => {
			const syllables = this.syllables.filter(s => s.isPermittedPosition(i, syllableAmount))
			return syllables[weightedChoice(syllables.map(s => s.weight))].generate()
		})
		return this.prefix + string.join(this.infix) + this.suffix
	}
	
	/**
	 * Generate a stem by its syllables.
	 *
	 * @return {string}
	 *   The generated stem.
	 */
	generate()
	{
		for(var i=0; i<this.retryCount; i++)
		{
			const stem = this.#unfilteredGenerate()
			const rejectedFilter = this.filters.find(filter =>
			{
				if(typeof filter === "function")
				{
					return filter(stem)
				}
				else if(Array.isArray(filter))
				{
					filter[0].lastIndex = 0
					return filter[0].test(stem)
						&& Math.random() > filter[1]
				}
				else
				{
					filter.lastIndex = 0
					return filter.test(stem)
				}
			})
			if(!rejectedFilter) return stem
			
			console.debug("Rejection [%s] %s",
					(i+1).toString().padStart(2, "0"), stem,
				rejectedFilter)
		}
		throw "Too many filter rejected stems"
	}
}

/**
 * A word formed from a stem.
 * A Word object may represent an inflection such as a noun declension, verb
 * conjugation, derivation, etc. Finally, the replacements may also remove
 * the helper characters (prefixes, infixes and suffixes) and transliterate
 * the raw graphemes to the correct writing system.
 */
export class Word
{
	/**
	 * @param {Array.<function|Array.<RegExp,number>>} replacements
	 *     An array of replacements.
	 */
	constructor(replacements)
	{
		if(!(this instanceof Word))
			return new Word(replacements)
		this.replacements = (typeof replacements !== 'undefined')
			? replacements
			: []
	}
	
	/**
	 * Create a word from a stem
	 *
	 * @param {string} stemString
	 *   The stem string from which to create a word.
	 * @return {string}
	 *   The created word.
	 */
	create(stemString)
	{
		let replCount = 0
		return this.replacements.reduce((string, repl) =>
		{
			let newString = string
			if(typeof repl === "function")
			{
				newString = repl(string)
			}
			else
			{
				const tempNewString = string.replace(repl[0], repl[1])
				if(!(string != newString
					&& repl.length > 2
					&& Math.random() > repl[2]))
				{
					newString = tempNewString
				}
			}
			if(string != newString)
			{
				console.debug("Replacement [%s] %s => %s",
						(replCount++).toString().padStart(2, "0"),
						stemString, newString,
					repl)
			}
			return newString
		}, stemString)
	}
}
