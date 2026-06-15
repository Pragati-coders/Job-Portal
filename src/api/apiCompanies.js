import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Get all companies 
export async function getCompanies(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("companies")
    .select("*");

  if (error) {
    console.error("Error fetching companies:", error);
    return null;
  }
  return data;
}

// Add a new company 
export async function addNewCompany(token, _, data) {
  const supabase = await supabaseClient(token);

  const random = Math.floor(Math.random() * 90000);
  const fileName = `company-${random}-${data.name}`;

  const { error: storageError } = await supabase.storage
    .from("company-logo")
    .upload(fileName, data.logo);

  if (storageError) {
    throw new Error("Error uploading logo: " + storageError.message);
  }

  const logo_url = `${supabaseUrl}/storage/v1/object/public/company-logo/${fileName}`;

  const { data: company, error } = await supabase
    .from("companies")
    .insert([{ name: data.name, logo_url }])
    .select();

  if (error) {
    throw new Error("Error creating company: " + error.message);
  }
  return company;
}

// NEW: Get a single company by ID 
export async function getCompanyById(token, _, { company_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", company_id)
    .single();

  if (error) {
    console.error("Error fetching company:", error);
    return null;
  }
  return data;
}
