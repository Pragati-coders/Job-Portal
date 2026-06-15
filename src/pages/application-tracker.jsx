import { useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import { Link } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { getUserApplications } from "@/api/apiApplications";
import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Briefcase,
  Building2,
  MapPin,
} from "lucide-react";

const STATUS = {
  applied: {
    label: "Applied",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    bar: "bg-yellow-400",
    pct: "20%",
  },
  reviewing: {
    label: "Reviewing",
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    bar: "bg-blue-400",
    pct: "55%",
  },
  interviewing: {
    label: "Interviewing",
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    bar: "bg-purple-400",
    pct: "75%",
  },
  hired: {
    label: "Hired ✓",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    bar: "bg-green-400",
    pct: "100%",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    bar: "bg-red-400",
    pct: "100%",
  },
};

// ── Badge component ──────────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS[status] || STATUS.applied;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${s.bg} ${s.color}`}
    >
      <Icon size={11} />
      {s.label}
    </span>
  );
};

Badge.propTypes = {
  status: PropTypes.string.isRequired,
};

// ── Main component ───────────────────────────────────────────
const ApplicationTracker = () => {
  const { user } = useUser();
  const {
    data: apps,
    fn: fetchApps,
    loading,
  } = useFetch(getUserApplications);

  useEffect(() => {
    if (user?.id) {
      fetchApps({ user_id: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Count per status
  const counts = Object.fromEntries(
    Object.keys(STATUS).map((k) => [k, 0])
  );
  (apps || []).forEach((a) => {
    if (counts[a.status] !== undefined) counts[a.status]++;
  });

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">
          Application Tracker
        </h1>
        <p className="text-white/40 text-sm">
          See the status of every job you applied to.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
        {Object.entries(STATUS).map(([key, s]) => {
          const Icon = s.icon;
          return (
            <div
              key={key}
              className={`p-4 rounded-2xl border ${s.bg} flex flex-col gap-1`}
            >
              <Icon size={16} className={s.color} />
              <span className={`text-2xl font-bold ${s.color}`}>
                {counts[key]}
              </span>
              <span className="text-white/40 text-xs">{s.label}</span>
            </div>
          );
        })}
      </div>

      {loading && <BarLoader width="100%" color="#ffffff" />}

      {/* Empty state */}
      {!loading && (!apps || apps.length === 0) && (
        <div className="text-center py-20">
          <Briefcase size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">No applications yet.</p>
          <Link
            to="/jobs"
            className="text-white underline underline-offset-4 text-sm"
          >
            Browse Jobs →
          </Link>
        </div>
      )}

      {/* Application list */}
      <div className="flex flex-col gap-4">
        {(apps || []).map((app) => {
          const s = STATUS[app.status] || STATUS.applied;
          return (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {app.job?.company?.logo_url ? (
                    <img
                      src={app.job.company.logo_url}
                      alt={app.job.company.name}
                      className="w-10 h-10 rounded-lg bg-white/10 object-contain p-1"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Building2 size={18} className="text-white/30" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">
                      {app.job?.title}
                    </p>
                    <p className="text-white/40 text-sm">
                      {app.job?.company?.name}
                    </p>
                  </div>
                </div>
                <Badge status={app.status} />
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex justify-between mb-1">
                  {["applied", "reviewing", "interviewing", "hired"].map(
                    (step) => (
                      <span
                        key={step}
                        className={`text-xs capitalize ${
                          app.status === step ? "text-white" : "text-white/25"
                        }`}
                      >
                        {step}
                      </span>
                    )
                  )}
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                    style={{ width: s.pct }}
                  />
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-3 flex items-center gap-4 text-xs text-white/30 flex-wrap">
                {app.job?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {app.job.location}
                  </span>
                )}
                <span>
                  Applied:{" "}
                  {new Date(app.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <Link
                  to={`/job/${app.job_id}`}
                  className="ml-auto text-white/40 hover:text-white underline underline-offset-2"
                >
                  View Job →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTracker;