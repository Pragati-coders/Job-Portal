import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompanyById } from "@/api/apiCompanies";
import { getJobs } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { Building2, Briefcase, ArrowLeft } from "lucide-react";
import JobCard from "@/components/job-card";

// ❌ REMOVED: import CompanyProfile from "./pages/CompanyProfile"
//    That line was causing the error — a file cannot import itself!

function CompanyProfile() {
  const { id } = useParams();

  const {
    data: company,
    fn: fetchCompany,
    loading: loadingCompany,
  } = useFetch(getCompanyById);

  const {
    data: jobs,
    fn: fetchJobs,
    loading: loadingJobs,
  } = useFetch(getJobs);

  useEffect(() => {
    if (id) {
      fetchCompany({ company_id: id });
      fetchJobs({ company_id: id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <BarLoader color="#ffffff" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/companies"
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to companies
      </Link>

      {/* Company hero card */}
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 mb-8 flex items-start gap-6 flex-wrap">
        {company?.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-20 h-20 rounded-2xl bg-white/10 object-contain p-2"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
            <Building2 size={36} className="text-white/30" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">
            {company?.name}
          </h1>
          <span className="flex items-center gap-1 text-white/40 text-sm">
            <Briefcase size={14} />
            {(jobs || []).length} open role
            {(jobs || []).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Jobs section */}
      <h2 className="text-xl font-semibold text-white mb-5">
        Open Positions
      </h2>

      {loadingJobs && <BarLoader width="100%" color="#ffffff" />}

      {!loadingJobs && (!jobs || jobs.length === 0) && (
        <div className="text-center py-16">
          <Briefcase size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No open positions right now.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(jobs || []).map((job) => (
          <JobCard
            key={job.id}
            job={job}
            savedInit={job?.saved?.length > 0}
          />
        ))}
      </div>
    </div>
  );
}

export default CompanyProfile;