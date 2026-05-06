import { getArticles } from '../../lib/api'

export default async function ResourcesPage() {
  const { articles } = await getArticles().catch(() => ({ articles: [] }))

  return (
    <main className="shell py-12">
      <p className="text-sm font-black uppercase tracking-[0.3em] text-reef">Care Library</p>
      <h1 className="mt-3 font-display text-5xl font-black text-lagoon">Mental health resources</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <article key={article.id} className="panel p-6">
            <span className="badge">{article.category}</span>
            <h2 className="mt-4 font-display text-2xl font-black text-lagoon">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{article.desc}</p>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-reef">{article.readTime}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
