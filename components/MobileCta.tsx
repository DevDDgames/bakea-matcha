'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Bouton collant (mobile uniquement) qui ramène au formulaire ; caché quand le formulaire est à l'écran.
export default function MobileCta({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = document.getElementById('commander');
    if (!target || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  if (!mounted) return null;
  // Rendu directement dans <body> pour passer au-dessus du pied de page.
  return createPortal(
    <div className={'mobile-cta' + (show ? ' on' : '')} aria-hidden={!show}>
      <a href="#commander" tabIndex={show ? 0 : -1} className="btn orange">{label}</a>
    </div>,
    document.body,
  );
}
