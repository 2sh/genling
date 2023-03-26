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
	 * @param {string} [prefix=]
	 *   The string added to the front of a generated segment.
	 * @param {string} [suffix=]
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
		const phonemeIndex = weightedChoice(
			this.phonemes.map(p => p.weight))
		return this.prefix
			+ this.phonemes[phonemeIndex].grapheme
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
	 * @param {number} [props.weight=1]
	 *   The likelihood of being chosen as a syllable in a stem.
	 * @param {string} [props.prefix=]
	 *   The string added to the front of a generated syllable.
	 * @param {string} [props.suffix=]
	 *   The string added at the end of a generated syllable.
	 * @param {string} [props.infix=]
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
	 *   A stem is rejected when a function returns true or a regex
	 *   pattern matches the stem. The stem string to be filtered
	 *   includes the prefix, suffix and infixes specified in this
	 *   object.
	 * @param {string} [props.prefix=]
	 *   The string added to the front of a generated stem.
	 * @param {string} [props.suffix=]
	 *   The string added at the end of a generated stem.
	 * @param {string} [props.infix=]
	 *   The string inserted between generated syllables.
	 * @param {number} [props.timeout=2000]
	 *   The maximum amount of time in milliseconds to wait for a stem
	 *   to generate, after filtering, etc.
	 *   An error is thrown on reaching the maximum number.
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
		this.timeout = props.timeout || 2000
	}
	
	#generateUnfiltered()
	{
		const syllableAmount = weightedChoice(this.balance) + 1
		const syllableStrings = Array.from({length: syllableAmount},
			(_, i) =>
		{
			const syllables = this.syllables.filter(s =>
				s.isPermittedPosition(i, syllableAmount))
			const syllableIndex = weightedChoice(
				syllables.map(s => s.weight))
			return syllables[syllableIndex].generate()
		})
		return this.prefix
			+ syllableStrings.join(this.infix)
			+ this.suffix
	}
	
	#findRejectionFilter(stem)
	{
		return this.filters.find(filter =>
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
	}
	
	/**
	 * Generate a stem by its syllables.
	 *
	 * 	@param {number} [props.callback]
	 *   A callback which repeatedly receives a new stem as its first
	 *   argument, instead of just returning a single stem.
	 *   If the return value of the callback is false, the generator
	 *   counts that as rejected (if for example it wasn't unique),
	 *   making use of the timeout functionality. If the return value
	 *   is null, the generator stops.
	 * 	@param {number} [props.rejectionCallback]
	 *   A callback which receives the rejected stem as the first
	 *   argument, and the filter that rejected it as the second
	 *   argument.
	 * 
	 * @return {string}
	 *   The generated stem. The last one if a callback is specified.
	 */
	generate(callback, rejectionCallback)
	{
		let now = Date.now()
		do
		{
			const stem = this.#generateUnfiltered()
			const rejectionFilter = this.#findRejectionFilter(stem)
			
			if (!rejectionFilter)
			{
				if (!callback) return stem
				const r = callback(stem)
				if (r === null)
					return stem
				if (r !== false)
					now = Date.now()
			}
			else if (rejectionCallback)
			{
				rejectionCallback(stem, rejectionFilter)
			}
		}
		while (Date.now()-now < this.timeout)
		throw "Timed out. Too many rejected stems."
	}
}

/**
 * A word formed from a stem.
 * A Word object may represent an inflection such as a noun declension,
 * verb conjugation, derivation, etc. Finally, the replacements may also
 * remove the helper characters (prefixes, infixes and suffixes) and
 * transliterate the raw graphemes to the correct writing system.
 */
export class Word
{
	/**
	 * @param {Array.<function|Array.<RegExp,number>>} replacements
	 *     An array of replacements.
	 */
	constructor(replacements)
	{
		this.replacements = (typeof replacements !== 'undefined')
			? replacements
			: []
	}
	
	/**
	 * Create a word from a stem
	 *
	 * @param {string} stemString
	 *   The stem string from which to create a word.
	 * @param {string} replacementCallback
	 *   A callback which is called whenever a replacement has occured,
	 *   receiving the arguments of the original stem string,
	 *   the string before the change, the string after the change,
	 *   and the replacement that caused the change.
	 * @return {string}
	 *   The created word.
	 */
	create(stemString, replacementCallback)
	{
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
			if(replacementCallback && string != newString)
			{
				replacementCallback(stemString, string, newString, repl)
			}
			return newString
		}, stemString)
	}
}
