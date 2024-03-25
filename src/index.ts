import { TransitionStart } from "./transition";
import { Say, voiceReady } from "./voice";
import { InitInstaller } from "./install";

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
		case BreakMode.punctuation:
			if ([",", ".", "-", "?", "!"].includes(ev.key)) {
				target.value += ev.key;
				breaking = true;
			} else if (ev.key === "Enter") {
				breaking = true;
			}
			break;
		case BreakMode.submit:      breaking = ev.key === "Enter"; break;
	}

	if (!breaking) return;
	ev.stopImmediatePropagation();
	ev.stopPropagation();
	ev.preventDefault();

	let message = target.value.trim();
	if (message.length < 1) return;

	await TransitionStart();
	Say(message);

	const act = document.createElement("div");
	act.style.viewTransitionName = `message-${messageID}`;
	act.className = "act";
	act.addEventListener("click", (ev) => ActClick(act, ev));

	// const save = document.createElement('div');
	// save.className = "icon";
	// save.style.backgroundImage = `url('/media/save.svg')`;
	// save.setAttribute('data-action', 'save');
	// act.appendChild(save);

	const msg = document.createElement('div');
	msg.className = "msg";
	msg.innerText = message;
	act.appendChild(msg);

	historyRef.appendChild(act);
	historyRef.scrollBy(0, historyRef.scrollHeight);
	historyRef.style.height = "120px";

	reader.style.viewTransitionName = `message-${++messageID}`;
	reader.value = "";
}

function ActClick(self: HTMLDivElement, ev: MouseEvent) {
	const target = ev.target as HTMLElement;

	const action = target.getAttribute("data-action");
	if (action === "save") {
		// TODO
	}

	const msg = self.querySelector(".msg") as HTMLDivElement;
	Say(msg?.innerText);
}

function SetMode(modeStr: string){
	switch (modeStr) {
		case "continuous":  mode = BreakMode.continuous; break;
		case "punctuation": mode = BreakMode.punctuation; break;
		case "submit":      mode = BreakMode.submit; break;
		default: return;
	}
	localStorage.setItem('voice-mode', modeStr);
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
	modeSelectRef.addEventListener("change", ev => SetMode((ev.target as HTMLSelectElement).value || ""));

	const modeStr = localStorage.getItem('voice-mode');
	if (modeStr !== null) {
		for (const child of modeSelectRef.children) {
			const opt = child as HTMLOptionElement;
			if (opt.value === modeStr) child.setAttribute('selected', 'selected');
		}
		SetMode(modeStr);
	}
}


window.addEventListener("load", () => {
	InitInstaller();

	const poll = setInterval(() => {
		if (!voiceReady) return;

		clearInterval(poll);
		Startup();
	}, 1000)
});