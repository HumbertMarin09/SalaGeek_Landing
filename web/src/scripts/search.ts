interface Hit {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
}

export function mountSearch(): void {
  const input = document.querySelector<HTMLInputElement>('#q');
  const panel = document.querySelector<HTMLElement>('#search-panel');
  if (!input || !panel) return;
  let index: Hit[] = [];
  input.addEventListener('focus', async () => {
    if (index.length) return;
    const response = await fetch('/search-index.json');
    index = response.ok ? ((await response.json()) as Hit[]) : [];
  });
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    panel.replaceChildren();
    if (query.length < 2) {
      panel.hidden = true;
      return;
    }
    const hits = index
      .filter((item) => `${item.title} ${item.excerpt}`.toLowerCase().includes(query))
      .slice(0, 6);
    panel.hidden = hits.length === 0;
    for (const hit of hits) {
      const link = document.createElement('a');
      link.href = `/blog/articulos/${hit.slug}`;
      link.textContent = hit.title;
      panel.append(link);
    }
  });
}
