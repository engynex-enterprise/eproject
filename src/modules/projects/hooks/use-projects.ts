import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  projectsService,
  type CreateProjectData,
  type UpdateProjectData,
} from '../services/projects.service';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (orgId: number) => [...projectKeys.lists(), orgId] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (key: string) => [...projectKeys.details(), key] as const,
};

export function useProjects(orgId: number) {
  return useQuery({
    queryKey: projectKeys.list(orgId),
    queryFn: () => projectsService.getProjects(orgId),
    enabled: !!orgId,
  });
}

export function useProject(projectKey: string) {
  return useQuery({
    queryKey: projectKeys.detail(projectKey),
    queryFn: () => projectsService.getProjectByKey(projectKey),
    enabled: !!projectKey,
  });
}

export function useCreateProject(orgId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) =>
      projectsService.createProject(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(orgId) });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: number;
      data: UpdateProjectData;
    }) => projectsService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject(orgId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) =>
      projectsService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(orgId) });
    },
  });
}
