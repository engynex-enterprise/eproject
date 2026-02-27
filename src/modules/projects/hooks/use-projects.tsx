import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { CircleCheck, CircleX, Trash2, UserPlus } from 'lucide-react';
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
      sileo.success({
        title: 'Proyecto creado',
        icon: <CircleCheck className="size-4" />,
        description: (
          <span className="text-xs!">
            El proyecto se ha creado y esta listo para usar.
          </span>
        ),
      });
    },
    onError: () => {
      sileo.error({
        title: 'Error al crear el proyecto',
        icon: <CircleX className="size-4" />,
        description: (
          <span className="text-xs!">
            Intentalo de nuevo mas tarde.
          </span>
        ),
      });
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
      sileo.success({
        title: 'Proyecto actualizado',
        icon: <CircleCheck className="size-4" />,
        description: (
          <span className="text-xs!">
            Los cambios se han guardado correctamente.
          </span>
        ),
      });
    },
    onError: () => {
      sileo.error({
        title: 'Error al actualizar',
        icon: <CircleX className="size-4" />,
        description: (
          <span className="text-xs!">
            No se pudieron guardar los cambios.
          </span>
        ),
      });
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
      sileo.success({
        title: 'Proyecto eliminado',
        icon: <Trash2 className="size-4" />,
        description: (
          <span className="text-xs!">
            El proyecto ha sido eliminado permanentemente.
          </span>
        ),
      });
    },
    onError: () => {
      sileo.error({
        title: 'Error al eliminar',
        icon: <CircleX className="size-4" />,
        description: (
          <span className="text-xs!">
            No se pudo eliminar el proyecto.
          </span>
        ),
      });
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
      sileo.success({
        title: 'Miembro añadido',
        icon: <UserPlus className="size-4" />,
        description: (
          <span className="text-xs!">
            El miembro ha sido añadido al proyecto.
          </span>
        ),
      });
    },
    onError: (error: Error) => {
      const is409 = error?.message === 'Request failed with status code 409';
      sileo.error({
        title: is409 ? 'Usuario duplicado' : 'Error al añadir miembro',
        icon: <CircleX className="size-4" />,
        description: (
          <span className="text-xs!">
            {is409
              ? 'Este usuario ya es miembro del proyecto.'
              : 'No se pudo añadir el miembro.'}
          </span>
        ),
      });
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
