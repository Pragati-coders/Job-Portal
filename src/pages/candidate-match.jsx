import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import useFetch from "@/hooks/use-fetch";
import { getApplicationsByJob } from "@/api/apiApplications";
import { BarLoader } from "react-spinners";
import { Sparkles, ArrowLeft, User, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Score badge ──────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  const color =
    score >= 80
      ? "text-green-400 bg-green-400/10 border-green-400/20"
      : score >= 60
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${color}`}
    >
      <Star size={10} />
      {score}%
    </span>
  );
};

ScoreBadge.propTypes = {
  score: PropTypes.number.isRequired,
};

// ── Main component ───────────────────────────────────────────
const CandidateMatch = () => {
  const { jobId } = useParams();
  const { user } = useUser();
  const isRecruiter = user?.unsafeMetadata?.role === "recruiter";

  const {
    data: applications,
    fn: fetchApps,
    loading,
  } = useFetch(getApplicationsByJob);

  const [scores, setScores] = useState({});
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchApps({ job_id: jobId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // ── AI scoring ───────────────────────────────────────────
  const scoreAll = async () => {
    if (!applications?.length) return;
    setScoring(true);

    const jobTitle =
      applications[0]?.job?.title || "Software Engineer";
    const jobReqs =
      applications[0]?.job?.requirements || jobTitle;

    const prompt = `You are a talent evaluator. Score each candidate for this job.

Job: ${jobTitle}
Requirements: ${jobReqs}

Candidates:
${applications
  .map(
    (a, i) =>
      `${i + 1}. Name: ${a.candidate_name || "Candidate " + (i + 1)}
   Skills: ${a.skills || "not specified"}
   Experience: ${a.experience} years
   Education: ${a.education || "not specified"}`
  )
  .join("\n\n")}

Return ONLY a valid JSON array, no markdown, no explanation:
[{"name":"...","score":85,"reason":"one sentence","strengths":["skill1","skill2"]}]

Score 0-100. Be realistic.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text =
        data.content?.map((b) => b.text || "").join("") || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const map = {};
      parsed.forEach((p) => {
        map[p.name] = p;
      });
      setScores(map);
    } catch (e) {
      console.error("Scoring failed", e);
    } finally {
      setScoring(false);
    }
  };

  if (!isRecruiter) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-white/40">Recruiters only.</p>
      </div>
    );
  }

  // Sort by AI score descending
  const sorted = [...(applications || [])].sort((a, b) => {
    const sa = scores[a.candidate_name]?.score || 0;
    const sb = scores[b.candidate_name]?.score || 0;
    return sb - sa;
  });

  const hasScores = Object.keys(scores).length > 0;

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        to={`/job/${jobId}`}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to job
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Candidate Match
            </h1>
          </div>
          <p className="text-white/40 text-sm">
            AI ranks applicants by how well they fit your job.
          </p>
        </div>

        {applications?.length > 0 && !hasScores && (
          <Button
            onClick={scoreAll}
            disabled={scoring}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6"
          >
            {scoring ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Scoring...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                AI Score All
              </>
            )}
          </Button>
        )}
      </div>

      {loading && <BarLoader width="100%" color="#ffffff" />}

      {/* Empty state */}
      {!loading && (!applications || applications.length === 0) && (
        <div className="text-center py-20">
          <User size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">
            No applications yet for this job.
          </p>
        </div>
      )}

      {/* Candidate list */}
      <div className="flex flex-col gap-4">
        {sorted.map((app, idx) => {
          const scoreData = scores[app.candidate_name];
          return (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                    {(app.candidate_name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {app.candidate_name || "Anonymous"}
                    </p>
                    <p className="text-white/40 text-xs">
                      {app.experience} yrs exp · {app.education}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasScores && scoreData && (
                    <ScoreBadge score={scoreData.score} />
                  )}
                  {idx === 0 && hasScores && (
                    <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-1 rounded-full">
                      Top Match
                    </span>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="mt-3 flex flex-wrap gap-2">
                {(app.skills || "")
                  .split(",")
                  .filter(Boolean)
                  .map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded-full"
                    >
                      {s.trim()}
                    </span>
                  ))}
              </div>

              {/* AI insight */}
              {scoreData && (
                <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <p className="text-purple-300 text-xs font-medium mb-1">
                    AI Insight
                  </p>
                  <p className="text-white/60 text-sm">
                    {scoreData.reason}
                  </p>
                  {scoreData.strengths?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {scoreData.strengths.map((str) => (
                        <span
                          key={str}
                          className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20"
                        >
                          {str}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Resume link */}
              {app.resume && (
                <a
                  href={app.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-white/30 hover:text-white underline underline-offset-2 block"
                >
                  View Resume →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateMatch;
