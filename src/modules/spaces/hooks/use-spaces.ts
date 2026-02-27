import { useQuery } from '@tanstack/react-query';
import { getSpaces, getSpace } from '@/modules/spaces/services/spaces.service';

export function useSpaces(projectId: number | undefined) {
  return useQuery({
    queryKey: ['spaces', projectId],
    queryFn: () => getSpaces(projectId!),
    enabled: !!projectId,
  });
}

export function useSpace(spaceId: number | undefined) {
  return useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => getSpace(spaceId!),
    enabled: !!spaceId,
  });
}
