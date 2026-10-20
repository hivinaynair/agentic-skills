export function saveNote(text: string) {
  localStorage.setItem('draft-note', text);
  return { text };
}
