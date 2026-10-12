import sanitizeHtml from 'sanitize-html';

export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'iframe',
      'figure',
      'figcaption',
      'h1',
      'h2',
      'span',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      iframe: ['src', 'title', 'allow', 'allowfullscreen'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      '*': ['class'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  });
}
