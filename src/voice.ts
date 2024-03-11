import { TransitionStart } from "./transition";

export let voiceReady = false;
let voices: SpeechSynthesisVoice[];
let voicePitch = 1.0;
let voiceRate = 1.0;
let voiceIdx = 0;

let voiceSelectRef: HTMLSelectElement;
let voicePitchRef: HTMLInputElement;
let voiceRateRef: HTMLInputElement;
let stopRef: HTMLDivElement;

export function PopulateVoices() {
	voices = speechSynthesis.getVoices();
	if (!voices || voices.length == 0) return;

	voiceIdx = voices.findIndex(x => x.default);
	const saved = localStorage.getItem('voice-name');
	if (saved !== null) {
		voiceIdx = voices.findIndex(x => x.name === saved)
	};
	if (voiceIdx == -1) voiceIdx = voices.findIndex(x => x.name.includes("English"));
	if (voiceIdx == -1) voiceIdx = 0;

	for (let i=0; i<voices.length; i++) {
		const voice = voices[i];

		const sel = document.createElement("option");
		sel.innerText = voice.name;
		sel.value = i.toString();
		if (i === voiceIdx) sel.setAttribute("selected", "selected");

		voiceSelectRef.appendChild(sel);
	}

	voiceReady = true;
}

function VoiceChange(ev: Event) {
	const target = ev.target as HTMLSelectElement;
	const i = Number(target.value);

	if (voices && i+1 >= voices.length) return;
	voiceIdx = i;

	localStorage.setItem('voice-name', voices[i].name);
}


function ParameterChange() {
	voicePitch = Number(voicePitchRef.value);
	voiceRate = Number(voiceRateRef.value);
	localStorage.setItem('voice-pitch', voicePitch.toString());
	localStorage.setItem('voice-rate', voiceRate.toString());
}


export function Say(text: string) {
	let utterance = new SpeechSynthesisUtterance(text);
	utterance.voice = voices[voiceIdx];
	utterance.pitch = voicePitch;
	utterance.rate  = voiceRate;
	speechSynthesis.speak(utterance);

	stopRef.style.display = "block";
}

async function Stop() {
	speechSynthesis.cancel();

	await TransitionStart();
	stopRef.style.display = "none";
}


window.addEventListener("load", () => {
	// doesn't work on mobile, hence manual polling
	// speechSynthesis.onvoiceschanged = PopulateVoices;
	const poll = setInterval(() => {
		PopulateVoices();
		if (voiceReady) clearInterval(poll);
	}, 1000);


	voiceSelectRef = document.getElementById("voice") as HTMLSelectElement;
	if (voiceSelectRef) voiceSelectRef.addEventListener("change", VoiceChange);

	stopRef = document.getElementById("stop") as HTMLDivElement;
	stopRef.addEventListener("click", Stop);

	voicePitchRef = document.getElementById("voicePitch") as HTMLInputElement;
	voiceRateRef = document.getElementById("voiceRate") as HTMLInputElement;
	voicePitchRef.addEventListener("change", ParameterChange);
	voiceRateRef.addEventListener("change", ParameterChange);

	if (localStorage.getItem('voice-pitch') !== null) voicePitch = Number(localStorage.getItem('voice-pitch'));
	if (localStorage.getItem('voice-rate') !== null)  voiceRate = Number(localStorage.getItem('voice-rate'));

	voicePitchRef.value = voicePitch.toString();
	voiceRateRef.value = voiceRate.toString();
});