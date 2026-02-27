import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  boardService,
  type BoardData,
  type BoardFilters,
} from '../services/board.service';
import type { ApiResponse } from '@/shared/types';

export const boardKeys = {
  all: ['board'] as const,
  data: (projectKey: string, filters?: BoardFilters) =>
    [...boardKeys.all, projectKey, filters] as const,
};

export function useBoardData(projectKey: string, filters?: BoardFilters) {
  return useQuery({
    queryKey: boardKeys.data(projectKey, filters),
    queryFn: () => boardService.getBoardData(projectKey, filters),
    enabled: !!projectKey,
  });
}

export function useMoveIssue(projectKey: string, filters?: BoardFilters) {
  const queryClient = useQueryClient();
  const queryKey = boardKeys.data(projectKey, filters);

  return useMutation({
    mutationFn: ({
      issueId,
      statusId,
      position,
    }: {
      issueId: number;
      statusId: number;
      position: number;
    }) => boardService.moveIssue(issueId, statusId, position),

    onMutate: async ({ issueId, statusId, position }) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ApiResponse<BoardData>>(queryKey);

      queryClient.setQueryData<ApiResponse<BoardData>>(queryKey, (old) => {
        if (!old) return old;

        const newColumns = old.data.columns.map((col) => ({
          ...col,
          issues: col.issues.filter((issue) => issue.id !== issueId),
        }));

        // Find the moved issue
        let movedIssue = previous?.data.columns
          .flatMap((c) => c.issues)
          .find((i) => i.id === issueId);

        if (movedIssue) {
          movedIssue = { ...movedIssue, statusId, order: position };
          const targetCol = newColumns.find((c) => c.statusId === statusId);
          if (targetCol) {
            targetCol.issues.splice(position, 0, movedIssue);
            // Re-assign order to all issues in target column
            targetCol.issues.forEach((issue, idx) => {
              issue.order = idx;
            });
          }
        }

        return { ...old, data: { ...old.data, columns: newColumns } };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
