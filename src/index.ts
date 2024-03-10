let breakOn = {
	continuous: [" ", "Enter"],
	punctuation: [",", ".", "-", "?", "!", "Enter"],
	submit: ["Enter"],
};
let mode: keyof typeof breakOn = "continuous";

let voices: SpeechSynthesisVoice[];
let voiceIdx = 0;

function PopulateVoices() {
	const target = document.getElementById("voice");
	if (!target) return;

	voices = speechSynthesis.getVoices();
	for (let i=0; i<voices.length; i++) {
		const voice = voices[i];

		const sel = document.createElement("option");
		sel.innerText = voice.name;
		sel.value = i.toString();

		target.appendChild(sel);
	}
}


function keydown(ev: KeyboardEvent) {
	const target = ev.target as HTMLInputElement;

	if (breakOn[mode].includes(ev.key)) {
		ev.stopImmediatePropagation();
		ev.stopPropagation();
		ev.preventDefault();

		let utterance = new SpeechSynthesisUtterance(target.value);
		utterance.voice = voices[voiceIdx];
		speechSynthesis.speak(utterance);
		target.value = "";
		return;
	}
}

function modeChange(ev: Event) {
	const target = ev.target as HTMLSelectElement;
	if (breakOn.hasOwnProperty(target.value)) mode = target.value as any;
}

function voiceChange(ev: Event) {
	const target = ev.target as HTMLSelectElement;
	const i = Number(target.value);

	if (!voices[i]) return;
	voiceIdx = i;
}


function Startup() {
	const reader = document.getElementById("input");
	reader?.addEventListener("keydown", keydown);
	reader?.focus();

	const modeSelect = document.getElementById("mode");
	modeSelect?.addEventListener("change", modeChange);

	const target = document.getElementById("voice");
	if (target) target.addEventListener("change", voiceChange);
	speechSynthesis.onvoiceschanged = PopulateVoices;
}

window.addEventListener("load", Startup);