import { Editor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

interface User { email: string; name: string }
interface ArticleRow { id: string; slug: string; title: string; status: string }

async function api(path: string, init: RequestInit = {}, token = ''): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set('X-CSRF-Token', token);
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json');
  return fetch(path, { ...init, headers, credentials: 'same-origin' });
}

function lights(title: string, excerpt: string, meta: string): string[] {
  const score = (length: number, min: number, max: number) =>
    length >= min && length <= max ? 'ok' : 'warn';
  return [
    score(title.length, 50, 60),
    score(excerpt.length, 100, 200),
    score(meta.length, 150, 160),
  ];
}

function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [meta, setMeta] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    api('/api/v3/auth.php?action=me').then(async (response) => {
      if (!response.ok) return;
      const payload = await response.json();
      setUser(payload.user);
      setToken(payload.csrfToken);
    });
  }, []);

  useEffect(() => {
    const node = document.querySelector<HTMLElement>('#article-editor');
    if (!node || editor) return;
    const instance = new Editor({
      element: node,
      extensions: [
        StarterKit,
        Underline,
        Link,
        Image,
        Youtube,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      content: localStorage.getItem('admin_draft_article') || '<p></p>',
    });
    instance.on('update', () => {
      localStorage.setItem('admin_draft_article', instance.getHTML());
    });
    setEditor(instance);
  }, [user, editor]);

  async function login(event: Event): Promise<void> {
    event.preventDefault();
    const response = await api('/api/v3/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setError('No se pudo entrar.');
      return;
    }
    const payload = await response.json();
    setUser(payload.user);
    setToken(payload.csrfToken);
  }

  async function load(): Promise<void> {
    const response = await api('/api/v3/articles.php');
    if (!response.ok) return;
    const payload = await response.json();
    setRows(payload.articles);
  }

  async function publish(): Promise<void> {
    const bodyHtml = editor?.getHTML() ?? '';
    const words = bodyHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    const response = await api('/api/v3/articles.php', {
      method: 'POST',
      body: JSON.stringify({
        title,
        slug: title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60),
        excerpt,
        metaDescription: meta,
        bodyHtml,
        categoryId: 'tecnologia',
        readMinutes: Math.max(1, Math.ceil(words / 200)),
      }),
    }, token);
    if (!response.ok) {
      setNotice('No se pudo guardar.');
      return;
    }
    const created = await response.json();
    const published = await api(`/api/v3/articles.php?action=publish&id=${created.article.id}`, { method: 'POST' }, token);
    const payload = await published.json();
    setNotice(payload.rebuild === 'queued' ? 'Publicado. El sitio se actualiza en unos minutos.' : 'Publicado.');
    localStorage.removeItem('admin_draft_article');
    await load();
  }

  if (!user) {
    return (
      <form onSubmit={login}>
        <h1>Admin</h1>
        <label>Correo<input value={email} onInput={(event) => setEmail((event.target as HTMLInputElement).value)} /></label>
        <label>Contraseña<input type="password" value={password} onInput={(event) => setPassword((event.target as HTMLInputElement).value)} /></label>
        <button type="submit">Entrar</button>
        {error && <p>{error}</p>}
      </form>
    );
  }

  const [titleLight, excerptLight, metaLight] = lights(title, excerpt, meta);
  return (
    <section>
      <h1>Hola, {user.name}</h1>
      <div class="row">
        <button type="button" onClick={load}>Ver artículos</button>
        <button type="button" onClick={publish}>Publicar</button>
      </div>
      <p>{notice}</p>
      <label>Título ({title.length}) <span class={titleLight}>{titleLight === 'ok' ? '50-60' : 'fuera de 50-60'}</span>
        <input value={title} onInput={(event) => setTitle((event.target as HTMLInputElement).value)} />
      </label>
      <label>Extracto ({excerpt.length}) <span class={excerptLight}>{excerptLight === 'ok' ? '100-200' : 'fuera de 100-200'}</span>
        <textarea value={excerpt} onInput={(event) => setExcerpt((event.target as HTMLTextAreaElement).value)} />
      </label>
      <label>Meta ({meta.length}) <span class={metaLight}>{metaLight === 'ok' ? '150-160' : 'fuera de 150-160'}</span>
        <textarea value={meta} onInput={(event) => setMeta((event.target as HTMLTextAreaElement).value)} />
      </label>
      <div id="article-editor" class="editor" />
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}><td>{row.title}</td><td>{row.status}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function mountAdmin(node: Element | null): void {
  if (node) render(<Admin />, node);
}
