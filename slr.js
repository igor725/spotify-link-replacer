/* TODO:
 *   - Добавить поддержку MutationObserver
 *   - ???
*/

(function () {
	const spotiUrl = "https://open.spotify.com/";
	const spotiTypes = [ "track/", "episode/", "artist/", "album/", "show/", "playlist/" ];
	const spotiSizes = { default: 80, episode: 152, artist: 240, album: 240, show: 232, playlist: 240 };
	const spotiRegex = new RegExp(spotiUrl + "(.+)/([a-z0-9]+)", "i");
	const spotiIDLength = 22;
	const spotiRules = {
		"vk.com": {
			"url-check": "/im",
			"msg-container": ".im-mess--text",
			"msg-bloat": ".im_msg_media_link",
			"scroll-fixer": () => {
				let se = document.scrollingElement;
				if (se.scrollTopMax - se.scrollTop < 550) {
					se.scrollTop = se.scrollTopMax;
				}
			},
			"post-process": ({ name, self }) => {
				if (name === "bloat") {
					self["scroll-fixer"]();
				}
			}
		},
		"web.telegram.org": {
			"url-check": "/z/",
			"msg-container": ".text-content",
			"scroll-fixer": () => {
				let se = document.querySelector(".MessageList.scrolled");
				if (se !== undefined && (se.scrollTopMax - se.scrollTop < 550)) {
					se.scrollTop = se.scrollTopMax;
				}
			},
			"post-process": ({ frame, message }) => {
				frame.style.overflow = "hidden";
				frame.style.marginTop = "0";
				frame.style.borderRadius = "0.375rem";

				frame.querySelector("iframe").style.marginTop = "0";
				frame.querySelector("a").style.top = "0";

				let mesgContainer = message.parentNode.parentNode;
				let mesgAppendix = mesgContainer.querySelector(".svg-appendix");
				if(mesgAppendix) mesgAppendix.style.display = "none";
				mesgContainer.style.background = "transparent";
				mesgContainer.style.padding = "0";

				message.querySelector(".MessageMeta").style.display = "none";
			}
		}
	};

	const rules = spotiRules[location.host];
	if (!rules) {
		console.error("No embed rules for current domain found");
		return;
	}

	let checkIsSpotifyLink = (t) => {
		let urlPos = t.indexOf(spotiUrl);
		if (urlPos == -1) return false;
		let pos = spotiUrl.length + urlPos;
		return spotiTypes.find(el => t.indexOf(el, pos) == pos);
	}

	let createSpotiIframe = (type, id) => {
		let link = type + "/" + id;
		let maindiv = document.createElement("div");
		maindiv.style.position = "relative";
		maindiv.style.height = (spotiSizes[type] || spotiSizes.default) + "px";

		let frame = document.createElement("iframe");
		if (rules["scroll-fixer"] !== undefined)
			frame.addEventListener("load", rules["scroll-fixer"]);
		frame.style.height = "100%";
		frame.src = spotiUrl + "embed/" + link;
		frame.allow = "encrypted-media";
		frame.style.marginTop = "6px";
		frame.style.minWidth = "380px";
		frame.style.width = "100%";
		frame.style.border = "0px";

		let euri = document.createElement("a");
		euri.style.zIndex = "999";
		euri.style.position = "absolute";
		euri.style.right = "0px";
		euri.style.top = "6px";
		euri.style.width = "30px";
		euri.style.height = "35px";
		euri.style.opacity = "0";
		euri.href = "spotify:" + link;
		euri.title = "Play on Spotify";

		maindiv.appendChild(frame);
		maindiv.appendChild(euri);

		return maindiv;
	}

	let runCallback = (name, obj) => {
		if (rules[name]) {
			obj.self = rules;
			return rules[name](obj);
		}
	}

	let isVisible = (el) => {
		let bounds = el.getBoundingClientRect();

		return (
			bounds.top >= 0 &&
			bounds.left >= 0 &&
			bounds.bottom <= (window.innerWidth || document.documentElement.clientHeight) &&
			bounds.bottom <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	setInterval(() => {
		if (rules["url-check"] && location.pathname !== rules["url-check"]) return;
		let links = Array.from(document.querySelectorAll("a:not([us-slr-processed='1'])"));

		for (let i = 0; i < links.length; i++) {
			let link = links[i];
			if(!isVisible(link)) continue;

			link.setAttribute("us-slr-processed", 1);
			let message = link.closest(rules["msg-container"]);

			if (message == link.parentNode) {
				let lurl = decodeURIComponent(link.href);
				if (checkIsSpotifyLink(lurl)) {
					let ex = lurl.match(spotiRegex);
					if (ex && ex.length > 2 && ex[2].length == spotiIDLength) {
						runCallback("pre-process", {
							"name": "message",
							"message": message
						});

						let frame = createSpotiIframe(ex[1], ex[2]);
						message.setAttribute("us-slr-processed", 1);
						message.insertBefore(frame, link);
						link.remove();

						runCallback("post-process", {
							"name": "message",
							"message": message,
							"frame": frame
						});
					}
				}
			}
		}

		if (rules["msg-bloat"] !== undefined) {
			let medialinks = Array.from(document.querySelectorAll(rules["msg-bloat"] + ":not([us-slr-processed='1'])"));
			for (let i = 0; i < medialinks.length; i++) {
				let medialink = medialinks[i];
				let upperDiv = medialink.parentNode;
				medialink.setAttribute("us-slr-processed", 1);
				if (upperDiv) {
					let messText = upperDiv.parentNode;
					if (messText.getAttribute("us-slr-processed") == 1) {
						upperDiv.remove();
						runCallback("post-process", {
							"name": "bloat"
						});
					}
				}
			}
		}
	}, 100);
})();
