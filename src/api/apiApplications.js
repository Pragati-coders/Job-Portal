import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Apply to a job 
export async function applyToJob(token, _, data) {
  const supabase = await supabaseClient(token);

  const random = Math.floor(Math.random() * 90000);
  const fileName = `resume-${random}-${data.candidate_id}`;

  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(fileName, data.resume);

  if (storageError) {
    throw new Error("Error uploading resume: " + storageError.message);
  }

  const resume_url = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

  const { data: application, error } = await supabase
    .from("applications")
    .insert([
      {
        job_id: data.job_id,
        candidate_id: data.candidate_id,
        status: "applied",
        resume: resume_url,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        candidate_name: data.candidate_name,
      },
    ])
    .select();

  if (error) {
    throw new Error("Error submitting application: " + error.message);
  }
  return application;
}

// ── Update application status ────────────────────────────────
export async function updateApplicationStatus(token, _, { app_id, status }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", app_id)
    .select();

  if (error) {
    throw new Error("Error updating status: " + error.message);
  }
  return data;
}

// ── Get applications for a job seeker (tracker page) ─────────
export async function getUserApplications(token, _, { user_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .select(
      `*,
      job:jobs (
        id,
        title,
        location,
        company:companies ( name, logo_url )
      )`
    )
    .eq("candidate_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user applications:", error);
    return null;
  }
  return data;
}

// ── Get applications for a specific job (recruiter) ───────────
export async function getApplicationsByJob(token, _, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .select(
      `*,
      job:jobs ( id, title, requirements )`
    )
    .eq("job_id", job_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching job applications:", error);
    return null;
  }
  return data;
}
