import sanitizeHtml from "sanitize-html";

export default function purifyHtml(string: string): string {
  if (!string) {
    return "";
  }
  return sanitizeHtml(string, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "iframe"]),
    allowedAttributes: {
      a: ["href", "name", "target", "loading"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "title", "allow", "frameborder"],
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
  });
}
