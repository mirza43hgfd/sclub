'use client';
// Injects raw ad HTML (e.g. Adsterra codes) and makes sure any <script>
// tags inside actually execute.
import { useEffect, useRef } from 'react';

export default function AdSlot({ code }) {
  const ref = useRef(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = '';
    if (!code || !code.trim()) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = code;
    // Re-create scripts so they execute on insertion
    tmp.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script');
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
    host.appendChild(tmp);
  }, [code]);

  if (!code || !code.trim()) return null;
  return (
    <div className="adslot">
      <div ref={ref} />
    </div>
  );
}
