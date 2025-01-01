import { gristSql } from "~/utils/grist-sql";

export default defineEventHandler(async () => {
  console.log("--- /api/challenge/word starts");
  const start = Date.now();

  const [record] = await gristSql<{ Photos: string }>(
    "select Word, Pronunciation, Meaning from Words order by RANDOM() limit 1",
  );

  const _runtime = Date.now() - start;
  console.log(`--- /api/challenge/word took ${_runtime}ms`);

  return { ...record, _runtime };
});
