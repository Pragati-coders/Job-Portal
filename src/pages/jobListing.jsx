import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import JobCard from "@/components/job-card";
import { getJobs } from "@/api/apiJobs";
import { getCompanies } from "@/api/apiCompanies";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { State } from "country-state-city";
import { Search, SlidersHorizontal, X } from "lucide-react";

// ─── Salary Range Slider ─────────────────────────────────────
const SalaryRangeSlider = ({ min, max, value, onChange }) => {
  const pct = (v) => ((v - min) / (max - min)) * 100;

  const handleMinChange = (e) => {
    const v = Number(e.target.value);
    if (v < value[1]) onChange([v, value[1]]);
  };

  const handleMaxChange = (e) => {
    const v = Number(e.target.value);
    if (v > value[0]) onChange([value[0], v]);
  };

  return (
    <div className="w-full select-none">
      <div className="flex justify-between text-xs text-white/40 mb-2">
        <span>₹{(value[0] / 100000).toFixed(0)}L</span>
        <span>
          ₹{(value[1] / 100000).toFixed(0)}L
          {value[1] === max ? "+" : ""}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        {/* filled track */}
        <div
          className="absolute h-2 bg-white rounded-full pointer-events-none"
          style={{
            left: `${pct(value[0])}%`,
            width: `${pct(value[1]) - pct(value[0])}%`,
          }}
        />
        {/* min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={100000}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          style={{ zIndex: value[0] > max - 200000 ? 5 : 3 }}
          aria-label="Minimum salary"
        />
        {/* max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={100000}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          style={{ zIndex: 4 }}
          aria-label="Maximum salary"
        />
        {/* thumb dots */}
        <div
          className="absolute w-4 h-4 bg-white rounded-full -top-1 border-2 border-black pointer-events-none"
          style={{ left: `calc(${pct(value[0])}% - 8px)` }}
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full -top-1 border-2 border-black pointer-events-none"
          style={{ left: `calc(${pct(value[1])}% - 8px)` }}
        />
      </div>
    </div>
  );
};

SalaryRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
};

// ─── Main JobListing page ─────────────────────────────────────
const JobListing = () => {
  const { isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState([0, 5000000]);

  const {
    data: jobs,
    fn: fnJobs,
    loading: loadingJobs,
  } = useFetch(getJobs);

  const { data: companies, fn: fnCompanies } = useFetch(getCompanies);

  useEffect(() => {
    fnCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fnJobs({ location, company_id: companyId, searchQuery });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, location, companyId, searchQuery]);

  // Client-side salary filter
  const filteredJobs = (jobs || []).filter((job) => {
    if (!job.salary_min && !job.salary_max) return true;
    const jobMin = job.salary_min || 0;
    const jobMax = job.salary_max || job.salary_min || 9999999;
    return jobMax >= salaryRange[0] && jobMin <= salaryRange[1];
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search_query.value.trim();
    setSearchQuery(q);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setCompanyId("");
    setSalaryRange([0, 5000000]);
  };

  if (!isLoaded) {
    return <BarLoader className="mb-4" width="100%" color="#ffffff" />;
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Find Jobs</h1>
        <p className="text-white/40 text-sm">
          Discover opportunities that match your skills.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            name="search_query"
            defaultValue={searchQuery}
            placeholder="Job title, skill, or keyword..."
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
          />
        </div>
        <Button
          type="submit"
          className="rounded-xl bg-white text-black hover:bg-white/90 px-6"
        >
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-white/20"
          onClick={() => setShowFilters((p) => !p)}
        >
          <SlidersHorizontal size={16} />
        </Button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Location */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                Location
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/20 text-white">
                  <SelectGroup>
                    <SelectItem value="">All locations</SelectItem>
                    {State.getStatesOfCountry("IN").map((s) => (
                      <SelectItem key={s.isoCode} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                Company
              </label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/20 text-white">
                  <SelectGroup>
                    <SelectItem value="">All companies</SelectItem>
                    {(companies || []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Salary Range Slider */}
            <div className="sm:col-span-2">
              <label className="text-xs text-white/40 uppercase tracking-widest mb-3 block">
                Salary Range (Annual)
              </label>
              <SalaryRangeSlider
                min={0}
                max={5000000}
                value={salaryRange}
                onChange={setSalaryRange}
              />
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="mt-4 flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
          >
            <X size={12} /> Clear all filters
          </button>
        </div>
      )}

      {/* Active filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {location && (
          <span className="flex items-center gap-1 text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">
            {location}
            <X
              size={10}
              className="cursor-pointer"
              onClick={() => setLocation("")}
            />
          </span>
        )}
        {companyId && (
          <span className="flex items-center gap-1 text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">
            {(companies || []).find((c) => String(c.id) === companyId)?.name}
            <X
              size={10}
              className="cursor-pointer"
              onClick={() => setCompanyId("")}
            />
          </span>
        )}
        {(salaryRange[0] > 0 || salaryRange[1] < 5000000) && (
          <span className="flex items-center gap-1 text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">
            ₹{(salaryRange[0] / 100000).toFixed(0)}L – ₹
            {(salaryRange[1] / 100000).toFixed(0)}L
            <X
              size={10}
              className="cursor-pointer"
              onClick={() => setSalaryRange([0, 5000000])}
            />
          </span>
        )}
      </div>

      {loadingJobs && <BarLoader width="100%" color="#ffffff" />}

      {!loadingJobs && (
        <p className="text-white/30 text-sm mb-5">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      )}

      {/* Empty state */}
      {!loadingJobs && filteredJobs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg">
            No jobs match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-white/50 underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Jobs grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            savedInit={job?.saved?.length > 0}
          />
        ))}
      </div>
    </div>
  );
};

export default JobListing;