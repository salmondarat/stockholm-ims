export default function SitemapPage() {
  const routes = [
    "/",
    "/features",
    "/features/mobile",
    "/features/barcoding",
    "/features/qr",
    "/features/integrations",
    "/features/alerts",
    "/features/reporting",
    "/solutions",
    "/solutions/inventory-management",
    "/solutions/supplies",
    "/solutions/assets",
    "/solutions/construction",
    "/solutions/electrical",
    "/solutions/medical",
    "/solutions/design",
    "/solutions/warehouse",
    "/solutions/education",
    "/solutions/field",
    "/solutions/manufacturing",
    "/solutions/nonprofit",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return (
    <main className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold">Sitemap</h1>
      <ul className="mt-6 space-y-2 list-disc pl-6">
        {routes.map((r) => (
          <li key={r}>
            <a className="hover:underline" href={r}>
              {r}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
