export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-14 space-y-6">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="text-muted">Have a question? Send us a note and we’ll get back to you.</p>
      <form className="max-w-xl space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input className="w-full border border-subtle rounded px-3 py-2 bg-transparent" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input type="email" className="w-full border border-subtle rounded px-3 py-2 bg-transparent" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm">Message</label>
          <textarea className="w-full border border-subtle rounded px-3 py-2 bg-transparent" rows={5} placeholder="How can we help?" />
        </div>
        <button className="btn btn-primary">Send</button>
      </form>
    </main>
  );
}
