import { redirect } from 'next/navigation';

export default async function ProjectRootPage({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const { projectKey } = await params;
  redirect(`/projects/${projectKey}/board`);
}
