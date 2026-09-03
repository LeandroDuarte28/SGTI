"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = ["OPEX", "CAPEX"] as const;
type ExpenseCategory = (typeof VALID_CATEGORIES)[number];
function isValidCategory(value: string): value is ExpenseCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Server Action — creates a contract. Restricted to IT_MANAGER+ by RLS
 * ("Contract: managers only"). CMP-style date validation (end >= start) is
 * enforced by the DB CHECK constraint `contract_dates_valid`.
 */
export async function createContract(formData: FormData): Promise<void> {
  const vendorName = formData.get("vendor_name");
  const title = formData.get("title");
  const category = formData.get("category");
  const startDate = formData.get("start_date");
  const endDate = formData.get("end_date");
  const value = formData.get("value");
  const renewalNoticeDays = formData.get("renewal_notice_days");

  if (typeof vendorName !== "string" || vendorName.trim().length === 0) {
    throw new Error("O fornecedor é obrigatório.");
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título é obrigatório.");
  }
  if (typeof category !== "string" || !isValidCategory(category)) {
    throw new Error("Selecione uma categoria válida.");
  }
  if (typeof startDate !== "string" || startDate.length === 0) {
    throw new Error("A data de início é obrigatória.");
  }
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error("Valor do contrato inválido.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("financial").from("Contract").insert({
    vendor_name: vendorName.trim(),
    title: title.trim(),
    category,
    start_date: startDate,
    end_date: typeof endDate === "string" && endDate.length > 0 ? endDate : null,
    value: parsedValue,
    renewal_notice_days:
      typeof renewalNoticeDays === "string" && renewalNoticeDays.length > 0
        ? Number(renewalNoticeDays)
        : 30,
  });

  if (error) {
    throw new Error(`Não foi possível criar o contrato: ${error.message}`);
  }

  redirect("/financial");
}
