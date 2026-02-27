import { redirect } from 'next/navigation';

export default async function SpaceRootPage({
  params,
}: {
  params: Promise<{ projectKey: string; spaceId: string }>;
}) {
  const { projectKey, spaceId } = await params;
  redirect(`/projects/${projectKey}/spaces/${spaceId}/board`);
}
