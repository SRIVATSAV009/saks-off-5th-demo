"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/session";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

const SUCCESS_MESSAGES: Record<string, string> = {
  "Export Orders to Fulfillment": "Exported {n} order(s) to the fulfillment feed.",
  "Rebuild Product Search Index": "Reindexed {n} product(s) for search and PLP facets.",
  "Send Abandoned Cart Emails": "Sent {n} abandoned-cart reminder email(s).",
  "Expire Outdated Promotions": "Checked promotions; disabled {n} expired code(s).",
};

// Simulates a Business Manager scheduled job run: does real work against the
// local DB where it's meaningful (e.g. actually disabling expired promos),
// and otherwise fabricates a plausible result, then writes to the job log —
// mirroring BM's Job Log / Job History view.
export async function runJob(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId"));

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) return;

  const startedAt = Date.now();
  let status = "Success";
  let message = "Job completed.";

  try {
    if (job.name === "Expire Outdated Promotions") {
      const result = await db.promotion.updateMany({
        where: { enabled: true, endDate: { lt: new Date() } },
        data: { enabled: false },
      });
      message = SUCCESS_MESSAGES[job.name].replace("{n}", String(result.count));
    } else if (job.name === "Export Orders to Fulfillment") {
      const count = await db.order.count({ where: { status: "Placed" } });
      message = SUCCESS_MESSAGES[job.name].replace("{n}", String(count));
    } else if (job.name === "Rebuild Product Search Index") {
      const count = await db.product.count();
      message = SUCCESS_MESSAGES[job.name].replace("{n}", String(count));
    } else if (job.name === "Send Abandoned Cart Emails") {
      const count = await db.cartItem.count();
      message = SUCCESS_MESSAGES[job.name].replace("{n}", String(count > 0 ? Math.max(1, Math.floor(count / 2)) : 0));
    }
  } catch (err) {
    status = "Failed";
    message = err instanceof Error ? err.message : "Unknown error";
  }

  const durationMs = Date.now() - startedAt + Math.floor(Math.random() * 400) + 80;

  await db.$transaction([
    db.job.update({
      where: { id: jobId },
      data: { lastRunAt: new Date(), lastStatus: status },
    }),
    db.jobLog.create({
      data: { jobId: job.id, jobName: job.name, status, message, durationMs },
    }),
  ]);

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/promotions");
}
