"use client";

import React from "react";
import { FormBuilderStudio } from "@/src/components/cms/FormBuilderStudio";
import { useRouter } from "next/navigation";

export default function FormBuilderNewPage() {
  const router = useRouter();
  return <FormBuilderStudio formId="new" onBack={() => router.push("/forms")} />;
}
