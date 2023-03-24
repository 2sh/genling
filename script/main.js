import languages from "./languages.js"
import { Word as GenlingWord } from "./genling.js"

const { createApp, shallowRef, watch } = Vue
const { createRouter, createWebHashHistory, useRouter, useRoute, onBeforeRouteUpdate } = VueRouter

const rawScript = {
	name: "Raw",
	wordObject: new GenlingWord([])
}

const useLocalStorage = (key, defaultValue) =>
{
	const type = typeof defaultValue.value
	const storedValue = localStorage.getItem(key)
	if (storedValue) defaultValue.value = JSON.parse(storedValue)
	watch(defaultValue, () => (defaultValue.value !== null
		? localStorage.setItem(key, JSON.stringify(defaultValue.value))
		: localStorage.removeItem(key)))
	return defaultValue
}

const Genling = 
{
	setup()
	{
		const router = useRouter()
		const route = useRoute()
		
		const stemList = shallowRef([])
		const wordList = shallowRef([])
		
		const wordAmount = useLocalStorage("wordAmount", shallowRef(20))
		
		const selectedLanguage = shallowRef()
		const selectedScript = shallowRef()
		
		const generateStems = () =>
		{
			const newStemList = []
			for(let x=0; x<100000; x++)
			{
				if(newStemList.length >= wordAmount.value) break;
				var stem = selectedLanguage.value.stemObject.generate()
				if(newStemList.indexOf(stem) > -1) continue;
				newStemList.push(stem)
			}
			stemList.value = newStemList
		}
		
		const createWords = () =>
		{
			wordList.value = stemList.value.map(s => selectedScript.value.wordObject.create(s))
		}
		
		const generate = () =>
		{
			generateStems()
			createWords()
		}
		
		const setRoute = (language, script) =>
		{
			router.push({
				name: "genling",
				params:
				{
					languageName: language.name,
					scriptName: script.name
				}
			})
		}
		
		const setCurrentRoute = () =>
			setRoute(selectedLanguage.value, selectedScript.value)
		
		const processParams = (to, from) =>
		{
			let isRedirect = false
			let language = languages.find(l => l.name == to.params.languageName)
			if (!language)
			{
				language = languages[0]
				isRedirect = true
			}
			let script = (to.params.scriptName === "Raw"
				? rawScript
				: language.scripts.find(s => s.name == to.params.scriptName))
			if (!script
				|| (script !== language.scripts[0] && from && from.params.languageName && from.params.languageName != language.name))
			{
				script = language.scripts[0]
				isRedirect = true
			}
				
			if (isRedirect)
			{
				setRoute(language, script)
			}
			else
			{
				selectedLanguage.value = language
				if (!from || from.params.languageName != to.params.languageName)
					generateStems()
				selectedScript.value = script
				if (!from || from.params.scriptName != to.params.scriptName)
					createWords()
			}
		}
		
		onBeforeRouteUpdate(async (...args) => processParams(...args))
		processParams(route)
		
		return {
			languages,
			selectedLanguage,
			selectedScript,
			setCurrentRoute,
			generate,
			wordAmount,
			rawScript,
			wordList,
		}
	},
	template: "#generator",
}

const appRouter = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			name: "genling",
			path: "/:languageName?/:scriptName?",
			component: Genling,
		}
	],
})

const app = createApp({})
app.use(appRouter)
app.mount("#genling")
