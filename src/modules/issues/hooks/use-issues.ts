import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  issuesService,
  type CreateIssueData,
  type IssueFilters,
  type UpdateIssueData,
} from '../services/issues.service';
import { boardKeys } from '@/modules/board/hooks/use-board';

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (projectKey: string, filters?: IssueFilters) =>
    [...issueKeys.lists(), projectKey, filters] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (issueKey: string) => [...issueKeys.details(), issueKey] as const,
  comments: (issueId: number) =>
    [...issueKeys.all, 'comments', issueId] as const,
  children: (issueId: number) =>
    [...issueKeys.all, 'children', issueId] as const,
};

export function useIssues(projectKey: string, filters?: IssueFilters) {
  return useQuery({
    queryKey: issueKeys.list(projectKey, filters),
    queryFn: () => issuesService.getIssues(projectKey, filters),
    enabled: !!projectKey,
  });
}

export function useIssue(issueKey: string) {
  return useQuery({
    queryKey: issueKeys.detail(issueKey),
    queryFn: () => issuesService.getIssue(issueKey),
    enabled: !!issueKey,
  });
}

export function useCreateIssue(projectKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: number;
      data: CreateIssueData;
    }) => issuesService.createIssue(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: boardKeys.data(projectKey),
      });
      queryClient.invalidateQueries({ queryKey: ['backlog', projectKey] });
    },
  });
}

export function useUpdateIssue(projectKey?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      data,
    }: {
      issueId: number;
      data: UpdateIssueData;
    }) => issuesService.updateIssue(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      if (projectKey) {
        queryClient.invalidateQueries({
          queryKey: boardKeys.data(projectKey),
        });
        queryClient.invalidateQueries({
          queryKey: ['backlog', projectKey],
        });
      }
    },
  });
}

export function useIssueComments(issueId: number) {
  return useQuery({
    queryKey: issueKeys.comments(issueId),
    queryFn: () => issuesService.getComments(issueId),
    enabled: !!issueId,
  });
}

export function useAddComment(issueId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: number;
    }) => issuesService.addComment(issueId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.comments(issueId),
      });
    },
  });
}

export function useChildIssues(issueId: number) {
  return useQuery({
    queryKey: issueKeys.children(issueId),
    queryFn: () => issuesService.getChildIssues(issueId),
    enabled: !!issueId,
  });
}
