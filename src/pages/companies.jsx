import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCompanies } from "@/api/apiCompanies";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { Building2, Search } from "lucide-react";

const Companies = () => {
  const [query, setQuery] = useState("");
  const {
    data: companies,
    fn: fetchCompanies,
    loading,
  } = useFetch(getCompanies);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = (companies || []).filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Companies</h1>
        <p className="text-white/40 text-sm">
          Browse companies hiring on HireFlow.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 mb-8 max-w-md">
        <Search size={16} className="text-white/30 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies..."
          className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
        />
      </div>

      {loading && <BarLoader width="100%" color="#ffffff" />}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No companies found.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((company) => (
          <Link key={company.id} to={`/company/${company.id}`}>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all flex flex-col items-center text-center gap-3 cursor-pointer">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-16 h-16 object-contain rounded-xl bg-white/10 p-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                  <Building2 size={28} className="text-white/30" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm">
                  {company.name}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  View open roles →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Companies;