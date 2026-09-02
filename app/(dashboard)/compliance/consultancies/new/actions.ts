"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — registers a consultancy/audit firm. Restricted to
 * IT_MANAGER+ by RLS ("Consultancy: managers can manage").
 */
export async function createConsultancy(formData: FormData): Promise<void> {
  const tradeName = formData.get("trade_name");
  const legalName = formData.get("legal_name");
  const cnpj = formData.get("cnpj");
  const contactName = formData.get("contact_name");
  const contactEmail = formData.get("contact_email");
  const specialties = formData.get("specialties");
  const ndaSigned = formData.get("nda_signed") === "on";

  if (typeof tradeName !== "string" || tradeName.trim().length === 0) {
    throw new Error("O nome fantasia é obrigatório.");
  }
  if (typeof legalName !== "string" || legalName.trim().length === 0) {
    throw new Error("A razão social é obrigatória.");
  }
  if (typeof cnpj !== "string" || cnpj.trim().length === 0) {
    throw new Error("O CNPJ é obrigatório.");
  }
  if (typeof contactName !== "string" || contactName.trim().length === 0) {
    throw new Error("O nome do contato principal é obrigatório.");
  }
  if (typeof contactEmail !== "string" || contactEmail.trim().length === 0) {
    throw new Error("O e-mail do contato principal é obrigatório.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("compliance").from("Consultancy").insert({
    trade_name: tradeName.trim(),
    legal_name: legalName.trim(),
    cnpj: cnpj.trim(),
    contact_name: contactName.trim(),
    contact_email: contactEmail.trim(),
    specialties:
      typeof specialties === "string" && specialties.trim().length > 0
        ? specialties.split(",").map((s) => s.trim())
        : [],
    nda_signed: ndaSigned,
    nda_date: ndaSigned ? new Date().toISOString().slice(0, 10) : null,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar a consultoria: ${error.message}`);
  }

  redirect("/compliance/consultancies");
}
