import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center pt-32">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Protocol-Driven Work. <br />
          <span className="text-indigo-600">Perfectly Synchronized.</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Manage complex projects with dynamic dependency graphs. 
          When task A finishes, task B unlocks automatically. 
          No more manual coordination.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            href="/projects" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 md:text-lg transition-all shadow-lg hover:shadow-xl"
          >
            My Projects
          </Link>
          <Link 
            href="/admin/protocols" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 md:text-lg transition-all"
          >
            Manage Protocols
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            emoji="📋" 
            title="Standardize" 
            desc="Create reusable templates for repeated workflows." 
          />
          <FeatureCard 
            emoji="🔒" 
            title="Lock & Unlock" 
            desc="Tasks remain locked until prerequisites are met." 
          />
          <FeatureCard 
            emoji="🚀" 
            title="Execute" 
            desc="Teams work in parallel without blocking each other." 
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ emoji, title, desc }: { emoji: string, title: string, desc: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  )
}
