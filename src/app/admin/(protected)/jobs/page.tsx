import { db } from "@/lib/db";
import { runJob } from "@/app/admin/(protected)/jobs/actions";

function fmtDateTime(d: Date | null) {
  if (!d) return "Never";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function JobsPage() {
  const [jobs, logs] = await Promise.all([
    db.job.findMany({ orderBy: { name: "asc" } }),
    db.jobLog.findMany({ orderBy: { startedAt: "desc" }, take: 20 }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Jobs</h1>
      <p className="text-sm text-[#9a9a9a] mb-6">
        Scheduled background jobs (BM Job Scheduler stand-in). Run manually here to simulate an
        on-demand execution and inspect the job log.
      </p>

      <table className="w-full text-sm border-collapse mb-10">
        <thead>
          <tr className="text-left text-[#9a9a9a] border-b border-[#3a3a3a]">
            <th className="py-2 pr-4 font-normal">Job</th>
            <th className="py-2 pr-4 font-normal">Schedule</th>
            <th className="py-2 pr-4 font-normal">Last Run</th>
            <th className="py-2 pr-4 font-normal">Last Status</th>
            <th className="py-2 pr-4 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-[#2a2a2a]">
              <td className="py-3 pr-4">
                <p>{job.name}</p>
                <p className="text-xs text-[#9a9a9a]">{job.description}</p>
              </td>
              <td className="py-3 pr-4 text-xs">{job.schedule}</td>
              <td className="py-3 pr-4 text-xs">{fmtDateTime(job.lastRunAt)}</td>
              <td className="py-3 pr-4">
                {job.lastStatus ? (
                  <span className={job.lastStatus === "Success" ? "text-[#a0e8a8]" : "text-[#e8a0a0]"}>
                    {job.lastStatus}
                  </span>
                ) : (
                  <span className="text-[#9a9a9a]">—</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <form action={runJob}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <button
                    type="submit"
                    className="bg-[#9c7a3c] text-[#1b1b1b] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-[#b28e4c]"
                  >
                    Run Now
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xs uppercase tracking-wide text-[#9a9a9a] mb-3">Job Log</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-[#9a9a9a]">No job runs yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-[#9a9a9a] border-b border-[#3a3a3a]">
              <th className="py-2 pr-4 font-normal">Time</th>
              <th className="py-2 pr-4 font-normal">Job</th>
              <th className="py-2 pr-4 font-normal">Status</th>
              <th className="py-2 pr-4 font-normal">Message</th>
              <th className="py-2 pr-4 font-normal">Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-[#2a2a2a]">
                <td className="py-2 pr-4 text-xs">{fmtDateTime(log.startedAt)}</td>
                <td className="py-2 pr-4 text-xs">{log.jobName}</td>
                <td className="py-2 pr-4">
                  <span className={log.status === "Success" ? "text-[#a0e8a8]" : "text-[#e8a0a0]"}>
                    {log.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-[#9a9a9a]">{log.message}</td>
                <td className="py-2 pr-4 text-xs">{log.durationMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
