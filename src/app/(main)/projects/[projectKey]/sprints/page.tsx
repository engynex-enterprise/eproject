import { redirect } from 'next/navigation';

export default async function LegacySprintsPage({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const { projectKey } = await params;
  redirect(`/projects/${projectKey}`);
}
