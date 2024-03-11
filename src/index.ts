import { TransitionStart } from "./transition";
import { Say, voiceReady } from "./voice";

declare global {
	interface CSSStyleDeclaration {
		viewTransitionName: string;
	}
}

enum BreakMode {
	continuous,
	punctuation,
	submit
}
let mode = BreakMode.continuous;


let reader: HTMLInputElement;
let modeSelectRef: HTMLSelectElement;
let optionsRef: HTMLDetailsElement;
let historyRef: HTMLDivElement;
let messageID = 0;


async function keydown(ev: KeyboardEvent) {
	const target = ev.target as HTMLInputElement;

	let breaking = false;

	switch (mode) {
		case BreakMode.continuous:  breaking = [" ", "Enter"].includes(ev.key); break;
		case BreakMode.punctuation: breaking = [",", ".", "-", "?", "!", "Enter"].includes(ev.key); break;
		case BreakMode.submit:      breaking = ev.key === "Enter"; break;
	}

	if (!breaking) return;
	ev.stopImmediatePropagation();
	ev.stopPropagation();
	ev.preventDefault();

	let message = target.value;
	Say(message);

	await TransitionStart();

	const act = document.createElement("div");
	act.innerText = message;
	act.style.viewTransitionName = `message-${messageID}`;
	historyRef.appendChild(act);
	historyRef.scrollBy(0, historyRef.scrollHeight);
	historyRef.style.height = "120px";

	reader.style.viewTransitionName = `message-${++messageID}`;
	reader.value = "";
}

function modeChange(ev: Event) {
	const target = ev.target as HTMLSelectElement;

	switch (target.value) {
		case "continuous":  mode = BreakMode.continuous; break;
		case "punctuation": mode = BreakMode.punctuation; break;
		case "submit":      mode = BreakMode.submit; break;
	}
}

function onFocus() {
	if (!optionsRef) return;
	optionsRef.removeAttribute("open");
}


function Startup() {
	reader = document.getElementById("input") as HTMLInputElement;
	reader.addEventListener("keydown", keydown);
	reader.addEventListener("focus", onFocus);
	reader.setAttribute('placeholder', "Type something");
	reader.removeAttribute('disabled');
	reader.focus();

	optionsRef = document.getElementById("options") as HTMLDetailsElement;
	historyRef = document.getElementById("history") as HTMLDivElement;

	modeSelectRef = document.getElementById("mode") as HTMLSelectElement;
	modeSelectRef.addEventListener("change", modeChange);
}


window.addEventListener("load", () => {
	const poll = setInterval(() => {
		if (!voiceReady) return;

		clearInterval(poll);
		Startup();
	}, 1000)
});