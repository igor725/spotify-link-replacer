// ==UserScript==
// @name         Spotify link replacer
// @namespace    https://igvx.ru/
// @version      1.2
// @description  Tiny userscript that replaces Spotify links in chats with embeded player
// @downloadURL  https://raw.githubusercontent.com/igor725/spotify-link-replacer/main/slr.user.js
// @updateURL    https://raw.githubusercontent.com/igor725/spotify-link-replacer/main/slr.meta.js
// @author       igor725
// @match        https://vk.com/*
// @match        https://web.telegram.org/z/*
// @icon         https://spotify.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==
!function(){const n="https://open.spotify.com/",i=["track/","episode/","artist/","album/","show/","playlist/"],a={default:80,episode:152,artist:240,album:240,show:232,playlist:240},c=new RegExp(n+"(.+)/([a-z0-9]+)","i");const d={"vk.com":{"url-check":"/im","msg-container":".im-mess--text","msg-bloat":".im_msg_media_link","scroll-fixer":()=>{let e=document.scrollingElement;e.scrollTopMax-e.scrollTop<550&&(e.scrollTop=e.scrollTopMax)},"post-process":({name:e,self:t})=>{"bloat"===e&&t["scroll-fixer"]()}},"web.telegram.org":{"url-check":"/z/","msg-container":".text-content","scroll-fixer":()=>{let e=document.querySelector(".MessageList.scrolled");void 0!==e&&e.scrollTopMax-e.scrollTop<550&&(e.scrollTop=e.scrollTopMax)},"post-process":({frame:e,message:t})=>{e.style.overflow="hidden",e.style.marginTop="0",e.style.borderRadius="0.375rem",e.querySelector("iframe").style.marginTop="0",e.querySelector("a").style.top="0";let o=t.parentNode.parentNode,l=o.querySelector(".svg-appendix");l&&(l.style.display="none"),o.style.background="transparent",o.style.padding="0",t.querySelector(".MessageMeta").style.display="none"}}}[location.host];if(d){let s=(e,t)=>{if(d[e])return t.self=d,d[e](t)};setInterval(()=>{if(!d["url-check"]||location.pathname===d["url-check"]){var l,t=Array.from(document.querySelectorAll("a:not([us-slr-processed='1'])"));for(let e=0;e<t.length;e++){let o=t[e];if((e=>{e=e.getBoundingClientRect();return 0<=e.top&&0<=e.left&&e.bottom<=(window.innerWidth||document.documentElement.clientHeight)&&e.bottom<=(window.innerWidth||document.documentElement.clientWidth)})(o)){o.setAttribute("us-slr-processed",1);let t=o.closest(d["msg-container"]);if(t==o.parentNode){let e=decodeURIComponent(o.href);!(t=>{var e=t.indexOf(n);if(-1==e)return!1;let o=n.length+e;return i.find(e=>t.indexOf(e,o)==o)})(e)||(l=e.match(c))&&2<l.length&&22==l[2].length&&(s("pre-process",{name:"message",message:t}),l=((e,t)=>{t=e+"/"+t;let o=document.createElement("div");o.style.position="relative",o.style.height=(a[e]||a.default)+"px";let l=document.createElement("iframe");void 0!==d["scroll-fixer"]&&l.addEventListener("load",d["scroll-fixer"]),l.style.height="100%",l.src=n+"embed/"+t,l.allow="encrypted-media",l.style.marginTop="6px",l.style.minWidth="380px",l.style.width="100%",l.frameBorder=0;let r=document.createElement("a");return r.style.zIndex="999",r.style.position="absolute",r.style.right="0px",r.style.top="6px",r.style.width="30px",r.style.height="35px",r.style.opacity="0",r.href="spotify:"+t,r.title="Play on Spotify",o.appendChild(l),o.appendChild(r),o})(l[1],l[2]),t.setAttribute("us-slr-processed",1),t.insertBefore(l,o),o.remove(),s("post-process",{name:"message",message:t,frame:l}))}}}if(void 0!==d["msg-bloat"]){var r=Array.from(document.querySelectorAll(d["msg-bloat"]+":not([us-slr-processed='1'])"));for(let o=0;o<r.length;o++){let e=r[o],t=e.parentNode;if(e.setAttribute("us-slr-processed",1),t){let e=t.parentNode;1==e.getAttribute("us-slr-processed")&&(t.remove(),s("post-process",{name:"bloat"}))}}}}},100)}else console.error("No embed rules for current domain found")}();