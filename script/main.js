(function()
{

var langDef = null;
var langIndex = 0;
var scriptDef = null;
var scriptIndex = 0;

var stemList = [];

var selectLanguage;
var selectScript;
var textAmount;
var buttonGenerate;
var pWords;

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
	var langName = selectLanguage.options[selectLanguage.selectedIndex].value;
	var scriptName = selectScript.options[selectScript.selectedIndex].value;
	window.location.hash = langName + "/" + scriptName;
}

function setLangIndexByName(name)
{
	for(var i=0; i<genlingLanguages.length; i++)
	{
		var lang = genlingLanguages[i];
		if(lang.name !== name) continue;
		langIndex = i;
		break;
	}
}

function setScriptIndexByName(name)
{
	for(var i=0; i<langDef.scripts.length; i++)
	{
		var script = langDef.scripts[i];
		if(script.name !== name) continue;
		scriptIndex = i;
		return;
	}
	scriptIndex = null;
}

function setupLangOptions()
{
	setupLangOptions.innerHTML = "";
	for(var i=0; i<genlingLanguages.length; i++)
	{
		var lang = genlingLanguages[i];
		var option = document.createElement("option");
		option.textContent = lang.name;
		option.value = lang.name;
		selectLanguage.appendChild(option);
	}
}

function setupScriptOptions()
{
	selectScript.innerHTML = "";
	for(var i=0; i<langDef.scripts.length; i++)
	{
		var script = langDef.scripts[i];
		var option = document.createElement("option");
		option.textContent = script.name;
		option.value = script.name;
		selectScript.appendChild(option);
	}
	var option = document.createElement("option");
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
	if(scriptIndex != null)
		var index = scriptIndex;
	else
		var index = selectScript.children.length-1;
	selectScript.children[index].selected = true;
}

function displayWords()
{
	var words = [];
	for(var i=0; i<stemList.length; i++)
	{
		var stem = stemList[i];
		if(scriptDef)
			stem = scriptDef.wordObject.create(stem);
		words.push(stem);
	}
	pWords.textContent = words.join(" ");
}

function readData()
{
	var prevLangDef = langDef;
	var prevScriptDef = scriptDef;
	
	var hash = getHash();
	
	if(hash && hash.length > 0) setLangIndexByName(hash[0]);
	langDef = genlingLanguages[langIndex];
	
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
	var amount = parseInt(textAmount.value);
	stemList = [];
	for(var i=0; i<amount; i++)
	{
		stemList.push(langDef.stemObject.generate());
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
	generateWords();
	
	window.addEventListener("hashchange", readData, false);
	selectLanguage.addEventListener("change", setHash, false);
	selectScript.addEventListener("change", setHash, false);
	buttonGenerate.addEventListener("click", generateWords, false);
}

})();