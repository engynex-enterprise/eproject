import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
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
      sileo.success({ title: 'Proyecto creado correctamente' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el proyecto', description: 'Inténtalo de nuevo.' });
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
      sileo.success({ title: 'Proyecto actualizado' });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el proyecto' });
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
      sileo.success({ title: 'Proyecto eliminado' });
    },
    onError: () => {
      sileo.error({ title: 'Error al eliminar el proyecto' });
    },
  });
}

export function useSearchUsers(orgId: number, email: string) {
  return useQuery({
    queryKey: ['users', 'search', orgId, email],
    queryFn: () => projectsService.searchUsers(orgId, email),
    enabled: !!orgId && email.length >= 2,
  });
}

export function useAddProjectMember(orgId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId, roleId }: { projectId: number; userId: number; roleId: number }) =>
      projectsService.addProjectMember(projectId, { userId, roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      sileo.success({ title: 'Miembro añadido al proyecto' });
    },
    onError: (error: Error) => {
      const msg = error?.message === 'Request failed with status code 409'
        ? 'Este usuario ya es miembro del proyecto.'
        : 'Error al añadir el miembro.';
      sileo.error({ title: msg });
    },
  });
}

export function useProjectRoles(orgId: number) {
  return useQuery({
    queryKey: ['roles', 'all', orgId],
    queryFn: () => projectsService.getRoles(orgId),
    enabled: !!orgId,
  });
}
