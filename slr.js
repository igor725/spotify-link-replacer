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
			"link-selector": "div.im-mess--text > a",
			"msg-bloat": "div.im-mess--text > div > div.im_msg_media_link",
			"scroll-fixer": () => {
				const se = document.scrollingElement;
				if (se.scrollTopMax - se.scrollTop < 550) {
					se.scrollTop = se.scrollTopMax;
				}
			},
			"post-process": ({ frame, name, self }) => {
				if (name === "bloat") {
					self["scroll-fixer"]();
				} else if (name === "message") {
                    const hid = document.createElement('div');
                    hid.style.zIndex = 998;
                    hid.style.position = 'absolute';
                    hid.style.top = '0px';
                    hid.style.border = '10px var(--vkui--color_background_content) solid';
                    hid.style.borderRadius = '0.9rem';
                    hid.style.width = '99%';
                    hid.style.height = '97%';
                    hid.style.margin = '0';
                    hid.style.padding = '0';
                    hid.style.left = '-8px';
                    hid.style.pointerEvents = 'none';
                    frame.appendChild(hid);
                }
			}
		},
		"web.telegram.org": {
			"url-check": "/a/",
			"link-selector": "div.text-content > a.text-entity-link",
			"scroll-fixer": () => {
				const se = document.querySelector(".MessageList.scrolled");
				if (se != undefined && (se.scrollTopMax - se.scrollTop < 550)) {
					se.scrollTop = se.scrollTopMax;
				}
			},
			"post-process": ({ frame, message }) => {
				frame.style.overflow = "hidden";
				frame.style.marginTop = "0";
				frame.style.borderRadius = "0.9rem";

				frame.querySelector("iframe").style.marginTop = "0";
				frame.querySelector("a").style.top = "0";

				const mesgContainer = message.parentNode.parentNode;
				mesgContainer.style.background = "transparent";
				mesgContainer.style.padding = "0";

				const mesgAppendix = mesgContainer.querySelector(".svg-appendix");
				if(mesgAppendix) mesgAppendix.style.display = "none";

				const mesgPage = mesgContainer.querySelector(".WebPage");
				if(mesgPage) mesgPage.style.display = "none";

				const mesgMeta = mesgContainer.querySelector(".MessageMeta");
				if(mesgMeta) mesgMeta.style.display = "none";
			}
		}
	};

	const rules = spotiRules[location.host];
	if (!rules) {
		console.error("No embed rules for current domain found");
		return;
	}

	let checkIsSpotifyLink = (t) => {
		const urlPos = t.indexOf(spotiUrl);
		if (urlPos == -1) return false;
		const pos = spotiUrl.length + urlPos;
		return spotiTypes.find(el => t.indexOf(el, pos) == pos);
	}

	let createSpotiIframe = (type, id) => {
		const link = type + "/" + id;
		const maindiv = document.createElement("div");
		maindiv.style.position = "relative";
		maindiv.style.height = (spotiSizes[type] || spotiSizes.default) + "px";

		const frame = document.createElement("iframe");
		if (rules["scroll-fixer"] !== undefined)
			frame.addEventListener("load", rules["scroll-fixer"]);
		frame.style.height = "100%";
		frame.src = spotiUrl + "embed/" + link;
		frame.allow = "encrypted-media";
		frame.style.marginTop = "6px";
		frame.style.minWidth = "380px";
		frame.style.width = "100%";
		frame.style.border = "0px";

		const euri = document.createElement("a");
		euri.style.zIndex = "999";
		euri.style.position = "absolute";
		euri.style.right = "8px";
		euri.style.top = "15px";
		euri.style.width = "16px";
		euri.style.height = "20px";
		euri.style.opacity = "0";
		euri.href = "spotify:" + link;
		euri.title = "Play on Spotify";

		maindiv.appendChild(frame);
		maindiv.appendChild(euri);

		return maindiv;
	}

	const runCallback = (name, obj) => {
		if (rules[name]) {
			obj.self = rules;
			return rules[name](obj);
		}
	}

	const isVisible = (el) => {
		const bounds = el.getBoundingClientRect();

		return (
			bounds.top >= 0 &&
			bounds.left >= 0 &&
			bounds.bottom <= (window.innerWidth || document.documentElement.clientHeight) &&
			bounds.bottom <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	setInterval(() => {
		if (rules["url-check"] && location.pathname !== rules["url-check"]) return;
		const links = Array.from(document.querySelectorAll(rules["link-selector"] + ":not([us-slr-processed='1'])"));

		for (let i = 0; i < links.length; i++) {
			const link = links[i];
			if(!isVisible(link)) continue;

			link.setAttribute("us-slr-processed", 1);
			const lurl = decodeURIComponent(link.href);
			if (checkIsSpotifyLink(lurl)) {
				const message = link.parentNode;
				const ex = lurl.match(spotiRegex);
				if (ex && ex.length > 2 && ex[2].length == spotiIDLength) {
					runCallback("pre-process", {
						"name": "message",
						"message": message
					});

					const frame = createSpotiIframe(ex[1], ex[2]);
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

		if (rules["msg-bloat"] !== undefined) {
			const medialinks = Array.from(document.querySelectorAll(rules["msg-bloat"] + ":not([us-slr-processed='1'])"));
			for (let i = 0; i < medialinks.length; i++) {
				const medialink = medialinks[i];
				const upperDiv = medialink.parentNode;
				medialink.setAttribute("us-slr-processed", 1);
				if (upperDiv) {
					const messText = upperDiv.parentNode;
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
