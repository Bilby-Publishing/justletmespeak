interface BeforeInstallPromptEvent extends Event {
	prompt: () => void;
	userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
}

let deferredPrompt: null | BeforeInstallPromptEvent = null;

function beforeInstallPromptHandler(e: Event) {
	e.preventDefault();

	deferredPrompt = e as BeforeInstallPromptEvent;

	const elm = document.getElementById("installer");
	if (!elm) return;

	elm.style.display = "flex";
	elm.onclick = InstallClick;
};

function InstallClick() {
	if (!deferredPrompt) return;

	deferredPrompt.prompt();
	deferredPrompt.userChoice.then((choiceResult: any) => {
		if (choiceResult.outcome === "accepted") {
			console.log("installed");
		}
	});
};


export function InitInstaller () {
	window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
}