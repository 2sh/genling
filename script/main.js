import languages from "./languages.js"

(function()
{

let langDef = null;
let langIndex = 0;
let scriptDef = null;
let scriptIndex = 0;

let stemList = [];

let selectLanguage;
let selectScript;
let textAmount;
let buttonGenerate;
let pWords;

function getHash()
{
	if(window.location.hash)
		return decodeURIComponent(
			window.location.hash.substring(1)).split("/");
	else
		return null;
}

function setHash()
{
	const langName = selectLanguage.options[selectLanguage.selectedIndex].value;
	const scriptName = selectScript.options[selectScript.selectedIndex].value;
	window.location.hash = langName + "/" + scriptName;
}

function setLangIndexByName(name)
{
	langIndex = languages.findIndex(l => l.name == name)
	if (!(langIndex >= 0)) langIndex = 0
}

function setScriptIndexByName(name)
{
	scriptIndex = langDef.scripts.findIndex(s => s.name == name)
	if (!(scriptIndex >= 0)) scriptIndex = null
}

function setupLangOptions()
{
	setupLangOptions.innerHTML = "";
	languages.forEach(lang =>
	{
		const option = document.createElement("option");
		option.textContent = lang.name;
		option.value = lang.name;
		selectLanguage.appendChild(option);
	})
}

function setupScriptOptions()
{
	selectScript.innerHTML = "";
	langDef.scripts.forEach(script =>
	{
		const option = document.createElement("option");
		option.textContent = script.name;
		option.value = script.name;
		selectScript.appendChild(option);
	})
	
	const option = document.createElement("option");
	option.textContent = "Raw";
	option.value = "Raw";
	selectScript.appendChild(option);
}

function selectLangOption()
{
	selectLanguage.children[langIndex].selected = true;
}

function selectScriptOption()
{
	const index = scriptIndex != null
		? scriptIndex
		: selectScript.children.length-1
	selectScript.children[index].selected = true;
}

function displayWords()
{
	pWords.innerHTML = "";
	stemList.forEach((stem, i) =>
	{
		if(i>0) pWords.appendChild(document.createTextNode(" "));
		if(scriptDef) stem = scriptDef.wordObject.create(stem);
		const e = document.createElement("span");
		e.title = i+1;
		e.textContent = stem;
		pWords.appendChild(e);
	})
}

function readData()
{
	const prevLangDef = langDef;
	const prevScriptDef = scriptDef;
	
	const hash = getHash();
	
	if(hash && hash.length > 0) setLangIndexByName(hash[0]);
	langDef = languages[langIndex];
	
	if(hash && hash.length > 1) setScriptIndexByName(hash[1]);
	if(langDef.scripts[scriptIndex] !== undefined)
		scriptDef = langDef.scripts[scriptIndex];
	else
		scriptDef = null;
	
	if(prevLangDef != langDef)
	{
		if(prevLangDef != null)
			scriptIndex = 0;
		selectLangOption();
		setupScriptOptions();
		selectScriptOption();
		generateWords();
		if(prevLangDef != null)
			setHash();
		
	}
	else if(prevScriptDef != scriptDef)
	{
		selectScriptOption();
		displayWords();
	}
}

function generateWords()
{
	const amount = parseInt(textAmount.value);
	stemList = [];
	let i = 0;
	for(let x=0; x<100000; x++)
	{
		if(i >= amount) break;
		var stem = langDef.stemObject.generate();
		if(stemList.indexOf(stem) > -1) continue;
		stemList.push(stem);
		i++;
	}
	displayWords();
}

window.init = function()
{
	selectLanguage = document.getElementById("select-language");
	selectScript = document.getElementById("select-script");
	textAmount = document.getElementById("text-amount");
	buttonGenerate = document.getElementById("button-generate");
	pWords = document.getElementById("p-words");
	
	setupLangOptions();
	readData();
	
	selectLanguage.addEventListener("change", setHash, false);
	selectScript.addEventListener("change", setHash, false);
	buttonGenerate.addEventListener("click", generateWords, false);
	
	window.addEventListener("hashchange", readData, false);
}

})();
