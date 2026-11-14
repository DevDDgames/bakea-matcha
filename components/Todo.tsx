// Surligne en jaune les informations à compléter par Bakea.
export default function Todo({ children }: { children: React.ReactNode }) {
  return <span className="todo">[{children}]</span>;
}
