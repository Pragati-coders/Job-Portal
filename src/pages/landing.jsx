import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { getJobs } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import {
  Briefcase,
  Search,
  Users,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Star,
  Building2,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

// ─── Stat Card ───────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon }) => (
  <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
    <Icon className="mb-3 text-white/50" size={26} />
    <span className="text-4xl font-bold text-white">{value}</span>
    <span className="text-sm text-white/40 mt-1">{label}</span>
  </div>
);

StatCard.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

// ─── Feature Card ────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:scale-[1.01] transition-all">
    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
      <Icon size={20} className="text-white" />
    </div>
    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
  </div>
);

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

// ─── Job Preview Card ────────────────────────────────────────
const JobPreviewCard = ({ job }) => (
  <Link to={`/job/${job.id}`}>
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3 mb-3">
        {job.company?.logo_url ? (
          <img
            src={job.company.logo_url}
            alt={job.company.name}
            className="w-9 h-9 rounded-lg bg-white/10 object-contain p-1"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 size={16} className="text-white/30" />
          </div>
        )}
        <div>
          <p className="text-white text-sm font-medium line-clamp-1">
            {job.title}
          </p>
          <p className="text-white/40 text-xs">{job.company?.name}</p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-white/30">
            <MapPin size={10} />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-white/30">
          <Clock size={10} />
          Recent
        </span>
      </div>
    </div>
  </Link>
);

JobPreviewCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    location: PropTypes.string,
    company: PropTypes.shape({
      name: PropTypes.string,
      logo_url: PropTypes.string,
    }),
  }).isRequired,
};

// ─── How It Works Step ───────────────────────────────────────
const Step = ({ num, title, desc }) => (
  <div className="flex gap-4 items-start">
    <div className="w-9 h-9 shrink-0 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm">
      {num}
    </div>
    <div>
      <h4 className="text-white font-semibold mb-1 text-sm">{title}</h4>
      <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

Step.propTypes = {
  num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

// ─── Main Landing Page ───────────────────────────────────────
const LandingPage = () => {
  const { isSignedIn } = useUser();
  const [search, setSearch] = useState("");
  const { data: jobs, fn: fetchJobs } = useFetch(getJobs);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/jobs?search=${encodeURIComponent(search)}`;
    } else {
      window.location.href = "/jobs";
    }
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center pt-24 pb-20 px-4 overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-white/50">
          <Star size={10} className="text-yellow-400" />
          The smarter way to hire &amp; get hired
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl sm:text-7xl font-bold text-white tracking-tight leading-tight max-w-3xl">
          Find Your Dream Job
          <br />
          and get{" "}
          <span className="inline-block border border-white/30 rounded-xl px-4 bg-white text-black">
            HireFlow&apos;d
          </span>
        </h1>

        <p className="relative mt-6 text-white/40 max-w-lg text-base sm:text-lg">
          Explore thousands of job listings or find the perfect candidate.
          Powered by real-time data and AI matching.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="relative mt-10 w-full max-w-xl flex gap-2"
        >
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3">
            <Search size={15} className="text-white/30 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, company, or keyword..."
              className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
            />
          </div>
          <Button
            type="submit"
            className="rounded-xl bg-white text-black hover:bg-white/90 px-6 font-semibold"
          >
            Search
          </Button>
        </form>

        {/* CTA buttons */}
        <div className="relative mt-6 flex gap-3 flex-wrap justify-center">
          <Link to="/jobs">
            <Button className="rounded-xl bg-white text-black hover:bg-white/90 font-semibold px-6">
              Browse Jobs <ChevronRight size={15} className="ml-1" />
            </Button>
          </Link>
          <Link to="/companies">
            <Button
              variant="outline"
              className="rounded-xl border-white/20 text-white hover:bg-white/10 px-6"
            >
              View Companies
            </Button>
          </Link>
          {isSignedIn && (
            <Link to="/post-job">
              <Button
                variant="outline"
                className="rounded-xl border-white/20 text-white hover:bg-white/10 px-6"
              >
                Post a Job
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value="10K+" label="Active Jobs" icon={Briefcase} />
          <StatCard value="5K+" label="Companies" icon={Building2} />
          <StatCard value="50K+" label="Job Seekers" icon={Users} />
          <StatCard value="98%" label="Success Rate" icon={TrendingUp} />
        </div>
      </section>

      {/* ── Latest Jobs ── */}
      {jobs && jobs.length > 0 && (
        <section className="px-4 pb-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">
              Latest Openings
            </h2>
            <Link
              to="/jobs"
              className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {jobs.slice(0, 3).map((job) => (
              <JobPreviewCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why HireFlow?
          </h2>
          <p className="text-white/40 mt-2 text-sm">
            Everything you need. Nothing you don&apos;t.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={Zap}
            title="Salary Range Filter"
            desc="Filter jobs by salary range with a drag slider — find only roles within your budget."
          />
          <FeatureCard
            icon={Sparkles}
            title="AI Job Writer"
            desc="Type a role title. AI generates a complete professional job description instantly."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Application Tracker"
            desc="Track every application with a visual pipeline — Applied, Reviewing, Interviewing, Hired."
          />
          <FeatureCard
            icon={Shield}
            title="Smart Candidate Match"
            desc="AI scores and ranks applicants so recruiters hire faster with confidence."
          />
          <FeatureCard
            icon={Building2}
            title="Company Profiles"
            desc="Browse companies, see all their openings, and apply directly from their profile."
          />
          <FeatureCard
            icon={Users}
            title="Email Notifications"
            desc="Candidates get instant email updates when their application status changes."
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-4 pb-16 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-5 font-semibold">
                For Job Seekers
              </p>
              <div className="flex flex-col gap-5">
                <Step
                  num="1"
                  title="Create your profile"
                  desc="Sign up and tell us your skills and experience."
                />
                <Step
                  num="2"
                  title="Browse & apply"
                  desc="Filter by salary, location, or company. Apply in one click."
                />
                <Step
                  num="3"
                  title="Track applications"
                  desc="Watch your application move through the pipeline in real time."
                />
              </div>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-5 font-semibold">
                For Recruiters
              </p>
              <div className="flex flex-col gap-5">
                <Step
                  num="1"
                  title="Write with AI"
                  desc="Type your role title. AI generates the full job description instantly."
                />
                <Step
                  num="2"
                  title="Review candidates"
                  desc="AI scores all applicants so you spend time on the best fits."
                />
                <Step
                  num="3"
                  title="Hire fast"
                  desc="Update status, notify candidates, close the role — done."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-24 max-w-4xl mx-auto text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get HireFlow&apos;d?
          </h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto text-sm">
            Join thousands of professionals and companies already using
            HireFlow.
          </p>
          <Link to="/jobs">
            <Button className="rounded-xl bg-white text-black hover:bg-white/90 font-semibold px-8 py-5 text-base">
              Get Started — It&apos;s Free{" "}
              <ChevronRight size={15} className="ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-white/20 text-xs">
        <p>© 2026 HireFlow. Built with React, Supabase &amp; Clerk.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

