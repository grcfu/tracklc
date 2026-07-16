/**
 * LeetTrack — a lightweight, fully client-side LeetCode tracker.
 *
 * This is the app shell. Features are wired in incrementally:
 * data model, storage hook, header/tabs, lists, review queue, stats, etc.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            <span style={{ color: '#4285F4' }}>L</span>
            <span style={{ color: '#EA4335' }}>e</span>
            <span style={{ color: '#FBBC04' }}>e</span>
            <span style={{ color: '#4285F4' }}>t</span>
            <span style={{ color: '#34A853' }}>T</span>
            <span style={{ color: '#EA4335' }}>r</span>
            <span style={{ color: '#4285F4' }}>a</span>
            <span style={{ color: '#34A853' }}>c</span>
            <span style={{ color: '#FBBC04' }}>k</span>
          </h1>
          <p className="mt-2 text-muted">
            Your personal LeetCode tracker — scaffolding in progress.
          </p>
        </header>

        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <p className="text-muted">Project scaffolded. Building features next.</p>
        </div>
      </div>
    </div>
  )
}
