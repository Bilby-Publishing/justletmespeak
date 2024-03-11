export let voiceReady = false;
let voices: SpeechSynthesisVoice[];
let voiceIdx = 0;

let voiceSelectRef: HTMLSelectElement;
let voicePitchRef: HTMLInputElement;
let voiceRateRef: HTMLInputElement;

export function PopulateVoices() {
	voices = speechSynthesis.getVoices();
	if (!voices || voices.length == 0) return;

	for (let i=0; i<voices.length; i++) {
		const voice = voices[i];

		const sel = document.createElement("option");
		sel.innerText = voice.name;
		sel.value = i.toString();

		voiceSelectRef.appendChild(sel);
	}

	voiceIdx = voices.findIndex(x => x.default);
	if (voiceIdx == -1) voiceIdx = voices.findIndex(x => x.name.includes("English"));
	if (voiceIdx == -1) voiceIdx = 0;

	voiceReady = true;
}

function VoiceChange(ev: Event) {
	const target = ev.target as HTMLSelectElement;
	const i = Number(target.value);

	if (!voices[i]) return;
	voiceIdx = i;
}


export function Say(text: string) {
	let utterance = new SpeechSynthesisUtterance(text);
	utterance.voice = voices[voiceIdx];
	utterance.pitch = Number(voicePitchRef.value) || 1;
	utterance.rate = Number(voiceRateRef.value) || 1;
	speechSynthesis.speak(utterance);
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

	voicePitchRef = document.getElementById("voicePitch") as HTMLInputElement;
	voiceRateRef = document.getElementById("voiceRate") as HTMLInputElement;
});