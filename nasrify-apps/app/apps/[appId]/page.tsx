import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingByAppId, getApprovedListings } from "@/lib/marketplace/listings";
import { getInstallCount } from "@/lib/marketplace/installs";
import { AppCard } from "@/components/AppCard";

export const dynamic = "force-dynamic";

interface AppDetailPageProps {
  params: Promise<{
    appId: string;
  }>;
}

export async function generateMetadata({ params }: AppDetailPageProps) {
  const { appId } = await params;
  const app = await getListingByAppId(appId);

  if (!app) {
    return {
      title: "App Not Found - Nasrify Apps Hub",
    };
  }

  return {
    title: `${app.name} - Nasrify Apps Hub`,
    description: app.description || `Install ${app.name} on your Nasrify store.`,
  };
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { appId } = await params;
  const app = await getListingByAppId(appId);

  if (!app) {
    notFound();
  }

  const [installCount, allApps] = await Promise.all([
    getInstallCount(app.id),
    getApprovedListings({ limit: 8 }),
  ]);

  const relatedApps = allApps
    .filter((a) => a.appId !== app.appId)
    .filter((a) => a.category === app.category || allApps.indexOf(a) < 3)
    .slice(0, 3);

  let manifestData: any = null;
  if (app.manifestJson) {
    try {
      manifestData = JSON.parse(app.manifestJson);
    } catch {
      manifestData = null;
    }
  }

  const permissions: string[] = manifestData?.permissions || [];
  const extensionPoints: string[] = manifestData?.extensionPoints || [];

  const adminUrl = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
  const installUrl = `${adminUrl}/admin/apps?install=${encodeURIComponent(app.appId)}`;

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Apps Hub
          </Link>
          <span>/</span>
          <Link
            href={`/?category=${encodeURIComponent(app.category || "all")}`}
            className="capitalize hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {app.category || "all"}
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate">
            {app.name}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Hero Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                {app.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-16 h-16 object-contain rounded-xl"
                  />
                ) : (
                  <span>⚡</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {app.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    v{app.version}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 capitalize">
                    {app.category}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Developed by{" "}
                  {app.authorUrl ? (
                    <a
                      href={app.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {app.author}
                    </a>
                  ) : (
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {app.author}
                    </span>
                  )}
                  {installCount > 0 && (
                    <span className="ml-3 text-zinc-400 dark:text-zinc-500">
                      • {installCount} active install{installCount === 1 ? "" : "s"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex flex-col sm:items-end gap-3 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {app.pricing === "paid" && app.price ? `$${app.price.toFixed(2)}` : "Free"}
                </span>
                {app.pricing === "paid" && (
                  <span className="text-xs text-zinc-500">one-time / monthly</span>
                )}
              </div>
              <a
                id="install-app-button"
                href={`/api/marketplace/install?appId=${encodeURIComponent(app.appId)}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-base text-center"
              >
                <span>Install App</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Instant install on your Nasrify Admin
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                About this App
              </h2>
              <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-base">
                {app.description || "No description provided."}
              </div>
            </section>

            {/* Changelog */}
            {app.changelog && (
              <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                  Changelog & Updates
                </h2>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
                  {app.changelog}
                </div>
              </section>
            )}

            {/* Reviews / Ratings Placeholder */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Customer Ratings & Reviews
                </h2>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Coming Soon in Stage 37C
                </span>
              </div>
              <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <div className="text-3xl mb-2">⭐ ⭐ ⭐ ⭐ ⭐</div>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">
                  Verified reviews and merchant feedback system will be enabled soon.
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Only merchants who installed this app will be eligible to submit reviews.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Specs */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
                App Information
              </h3>
              <dl className="space-y-3.5 text-sm">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <dt className="text-zinc-500 dark:text-zinc-400">App Identifier</dt>
                  <dd className="font-mono text-zinc-900 dark:text-zinc-200 font-medium">
                    {app.appId}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <dt className="text-zinc-500 dark:text-zinc-400">Version</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-zinc-200">
                    {app.version}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <dt className="text-zinc-500 dark:text-zinc-400">Category</dt>
                  <dd className="capitalize text-zinc-900 dark:text-zinc-200 font-medium">
                    {app.category}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <dt className="text-zinc-500 dark:text-zinc-400">Pricing Model</dt>
                  <dd className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                    {app.pricing}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <dt className="text-zinc-500 dark:text-zinc-400">Approved Date</dt>
                  <dd className="text-zinc-900 dark:text-zinc-200">
                    {app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : "Verified"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Permissions & Extension Points */}
            {(permissions.length > 0 || extensionPoints.length > 0) && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3">
                  Capabilities & Access
                </h3>
                {permissions.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                      Permissions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2.5 py-1 text-xs font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extensionPoints.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                      Storefront Extensions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extensionPoints.map((pt) => (
                        <span
                          key={pt}
                          className="px-2.5 py-1 text-xs font-mono rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Developer Card */}
            <div className="bg-gradient-to-br from-indigo-900/10 via-zinc-900/5 to-purple-900/10 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                Want to build apps like this?
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Build apps for hundreds of high-volume Nasrify merchants. Distribute freely or monetize directly.
              </p>
              <Link
                href="/developer"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm"
              >
                Go to Developer Portal →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Apps */}
        {relatedApps.length > 0 && (
          <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              More Recommended Apps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedApps.map((relApp) => (
                <AppCard key={relApp.id} app={relApp} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
