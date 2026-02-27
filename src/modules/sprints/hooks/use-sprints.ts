import { useQuery } from '@tanstack/react-query';
import { sprintsService } from '@/modules/sprints/services/sprints.service';

export function useSprints(projectKey: string | undefined) {
  return useQuery({
    queryKey: ['sprints', projectKey],
    queryFn: () => sprintsService.getSprints(projectKey!),
    enabled: !!projectKey,
  });
}
