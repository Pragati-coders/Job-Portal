import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ArrowRight, Loader2 } from "lucide-react";

const FIELDS = [
  {
    name: "role",
    label: "Job Title *",
    placeholder: "e.g. Senior Frontend Engineer",
  },
  {
    name: "company",
    label: "Company Name",
    placeholder: "e.g. Acme Corp",
  },
  {
    name: "location",
    label: "Location",
    placeholder: "e.g. Bangalore / Remote",
  },
  {
    name: "skills",
    label: "Required Skills",
    placeholder: "e.g. React, TypeScript, Node.js",
  },
  {
    name: "exp",
    label: "Experience",
    placeholder: "e.g. 3-5 years",
  },
];

const AiJobWriter = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isRecruiter = user?.unsafeMetadata?.role === "recruiter";

  const [form, setForm] = useState({
    role: "",
    company: "",
    location: "",
    skills: "",
    exp: "",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Not a recruiter — show blocked screen
  if (!isRecruiter) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="text-center">
          <Sparkles size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">
            This feature is only for recruiters.
          </p>
          <Button onClick={() => navigate("/jobs")} variant="outline">
            Browse Jobs
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generate = async () => {
    if (!form.role.trim()) {
      setError("Please enter a job title.");
      return;
    }
    setError("");
    setLoading(true);
    setOutput("");

    const prompt = `Write a professional job description for the following role.

Job Title: ${form.role}
Company: ${form.company || "a fast-growing startup"}
Location: ${form.location || "Remote"}
Required Skills: ${form.skills || "to be determined"}
Experience Required: ${form.exp || "2+ years"}

Write a complete job description with these exact sections:
1. About the Role (2-3 sentences)
2. What You'll Do (5 bullet points)
3. What We're Looking For (5 bullet points)
4. Nice to Have (3 bullet points)
5. What We Offer (4 bullet points)

Keep it professional, engaging, and under 400 words. No placeholder text.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text =
        data.content?.map((b) => b.text || "").join("") || "";

      if (!text) throw new Error("Empty response from AI");
      setOutput(text);
    } catch (err) {
      setError("Failed to generate. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useInPostJob = () => {
    sessionStorage.setItem("ai_job_description", output);
    navigate("/post-job");
  };

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Job Writer</h1>
        </div>
        <p className="text-white/40 text-sm">
          Fill in the basics — AI writes the full description in seconds.
        </p>
      </div>

      {/* Form */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {FIELDS.map((f) => (
          <div
            key={f.name}
            className={f.name === "role" ? "sm:col-span-2" : ""}
          >
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
              {f.label}
            </label>
            <input
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/40 transition-colors"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <Button
        onClick={generate}
        disabled={loading}
        className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-semibold py-5 mb-8"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} className="mr-2" />
            Generate Job Description
          </>
        )}
      </Button>

      {/* Output */}
      {output && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white font-semibold">
              Generated Description
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-white/20 text-white/60 hover:text-white"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-white text-black hover:bg-white/90"
                onClick={useInPostJob}
              >
                Use in Post Job{" "}
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed border-t border-white/10 pt-4">
            {output}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiJobWriter;
