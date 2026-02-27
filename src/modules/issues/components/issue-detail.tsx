'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bug,
  BookOpen,
  CheckSquare,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
  ChevronsDown,
  Send,
  Paperclip,
  ChevronRight,
  Calendar,
  User,
  Tag,
  IterationCcw,
  Target,
} from 'lucide-react';
import type { Issue, Comment as IssueComment, User as IUser } from '@/shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useIssue,
  useUpdateIssue,
  useIssueComments,
  useAddComment,
  useChildIssues,
} from '../hooks/use-issues';

const typeIcons: Record<string, React.ElementType> = {
  Epic: Zap,
  Story: BookOpen,
  Task: CheckSquare,
  Bug: Bug,
};

const typeColors: Record<string, string> = {
  Epic: 'text-purple-500',
  Story: 'text-green-500',
  Task: 'text-blue-500',
  Bug: 'text-red-500',
};

const priorityIcons: Record<string, React.ElementType> = {
  highest: ChevronsUp,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
  lowest: ChevronsDown,
};

const priorityColors: Record<string, string> = {
  highest: 'text-red-600',
  high: 'text-red-400',
  medium: 'text-orange-400',
  low: 'text-blue-400',
  lowest: 'text-blue-300',
};

interface IssueDetailProps {
  issueKey: string;
  projectKey: string;
}

export function IssueDetail({ issueKey, projectKey }: IssueDetailProps) {
  const { data, isLoading } = useIssue(issueKey);
  const issue = data?.data;

  const updateIssue = useUpdateIssue(projectKey);
  const { data: commentsData } = useIssueComments(issue?.id ?? 0);
  const addComment = useAddComment(issue?.id ?? 0);
  const { data: childrenData } = useChildIssues(issue?.id ?? 0);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>(
    'comments',
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 gap-6 p-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="w-80 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-muted-foreground">
          Incidencia no encontrada
        </p>
      </div>
    );
  }

  const TypeIcon = typeIcons[issue.issueType?.name] ?? CheckSquare;
  const typeColor = typeColors[issue.issueType?.name] ?? 'text-gray-500';

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== issue.title) {
      updateIssue.mutate({
        issueId: issue.id,
        data: { title: titleValue.trim() },
      });
    }
    setEditingTitle(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ content: commentText.trim() });
    setCommentText('');
  };

  const comments = commentsData?.data ?? [];
  const children = childrenData?.data ?? [];

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${projectKey}/board`}>
                {projectKey}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{issue.issueKey}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Issue Key + Type */}
            <div className="flex items-center gap-2">
              <TypeIcon className={cn('size-5', typeColor)} />
              <span className="text-sm font-medium text-muted-foreground">
                {issue.issueKey}
              </span>
            </div>

            {/* Title */}
            {editingTitle ? (
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                className="text-xl font-bold"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-bold cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 py-0.5"
                onClick={() => {
                  setTitleValue(issue.title);
                  setEditingTitle(true);
                }}
              >
                {issue.title}
              </h1>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Descripcion</h3>
              <div className="min-h-[100px] rounded-md border p-3 text-sm whitespace-pre-wrap">
                {issue.description || (
                  <span className="text-muted-foreground italic">
                    Agregar una descripcion...
                  </span>
                )}
              </div>
            </div>

            {/* Child Issues */}
            {children.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Incidencias hijas ({children.length})
                </h3>
                <div className="rounded-md border divide-y">
                  {children.map((child) => {
                    const ChildIcon =
                      typeIcons[child.issueType?.name] ?? CheckSquare;
                    return (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/30 cursor-pointer"
                      >
                        <ChildIcon
                          className={cn(
                            'size-4',
                            typeColors[child.issueType?.name] ??
                              'text-gray-500',
                          )}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {child.issueKey}
                        </span>
                        <span className="truncate flex-1">{child.title}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: child.status?.color,
                            color: child.status?.color,
                          }}
                        >
                          {child.status?.name}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Adjuntos</h3>
              <Button variant="outline" size="sm">
                <Paperclip className="size-4" />
                Adjuntar archivo
              </Button>
            </div>

            <Separator />

            {/* Comments / History Tabs */}
            <div>
              <div className="flex gap-4 mb-4">
                <button
                  className={cn(
                    'text-sm font-medium pb-1 border-b-2 transition-colors',
                    activeTab === 'comments'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => setActiveTab('comments')}
                >
                  Comentarios ({comments.length})
                </button>
                <button
                  className={cn(
                    'text-sm font-medium pb-1 border-b-2 transition-colors',
                    activeTab === 'history'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => setActiveTab('history')}
                >
                  Historial
                </button>
              </div>

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>TU</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Agregar un comentario..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                      />
                      <Button
                        size="sm"
                        disabled={
                          !commentText.trim() || addComment.isPending
                        }
                        onClick={handleAddComment}
                      >
                        <Send className="size-3.5" />
                        Comentar
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar size="sm">
                        <AvatarImage
                          src={comment.author?.avatarUrl ?? undefined}
                        />
                        <AvatarFallback>
                          {comment.author?.firstName[0]}
                          {comment.author?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {comment.author?.firstName}{' '}
                            {comment.author?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(comment.createdAt),
                              "d MMM yyyy 'a las' HH:mm",
                              { locale: es },
                            )}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Historial de cambios no disponible aun.
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              {/* Status */}
              <DetailField label="Estado" icon={Target}>
                <Badge
                  style={{
                    backgroundColor: issue.status?.color + '20',
                    color: issue.status?.color,
                    borderColor: issue.status?.color,
                  }}
                  variant="outline"
                >
                  {issue.status?.name}
                </Badge>
              </DetailField>

              {/* Assignee */}
              <DetailField label="Asignado" icon={User}>
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage
                        src={issue.assignee.avatarUrl ?? undefined}
                      />
                      <AvatarFallback>
                        {issue.assignee.firstName[0]}
                        {issue.assignee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {issue.assignee.firstName} {issue.assignee.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Sin asignar
                  </span>
                )}
              </DetailField>

              {/* Reporter */}
              <DetailField label="Reportado por" icon={User}>
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage
                      src={issue.reporter?.avatarUrl ?? undefined}
                    />
                    <AvatarFallback>
                      {issue.reporter?.firstName[0]}
                      {issue.reporter?.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {issue.reporter?.firstName} {issue.reporter?.lastName}
                  </span>
                </div>
              </DetailField>

              {/* Priority */}
              <DetailField label="Prioridad" icon={ArrowUp}>
                {issue.priority ? (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const PIcon =
                        priorityIcons[issue.priority.level] ?? Minus;
                      const pColor =
                        priorityColors[issue.priority.level] ??
                        'text-gray-400';
                      return <PIcon className={cn('size-4', pColor)} />;
                    })()}
                    <span className="text-sm">{issue.priority.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Sin prioridad
                  </span>
                )}
              </DetailField>

              {/* Sprint */}
              <DetailField label="Sprint" icon={IterationCcw}>
                <span className="text-sm">
                  {issue.sprint?.name ?? (
                    <span className="text-muted-foreground">Ninguno</span>
                  )}
                </span>
              </DetailField>

              {/* Version */}
              <DetailField label="Version" icon={Tag}>
                <span className="text-sm">
                  {issue.version?.name ?? (
                    <span className="text-muted-foreground">Ninguna</span>
                  )}
                </span>
              </DetailField>

              {/* Story Points */}
              <DetailField label="Puntos de historia" icon={Target}>
                <span className="text-sm">
                  {issue.storyPoints ?? (
                    <span className="text-muted-foreground">-</span>
                  )}
                </span>
              </DetailField>

              {/* Dates */}
              <DetailField label="Fecha inicio" icon={Calendar}>
                <span className="text-sm">
                  {issue.startDate
                    ? format(new Date(issue.startDate), 'd MMM yyyy', {
                        locale: es,
                      })
                    : (
                        <span className="text-muted-foreground">-</span>
                      )}
                </span>
              </DetailField>

              <DetailField label="Fecha limite" icon={Calendar}>
                <span className="text-sm">
                  {issue.dueDate
                    ? format(new Date(issue.dueDate), 'd MMM yyyy', {
                        locale: es,
                      })
                    : (
                        <span className="text-muted-foreground">-</span>
                      )}
                </span>
              </DetailField>

              {/* Tags */}
              {issue.tags && issue.tags.length > 0 && (
                <DetailField label="Etiquetas" icon={Tag}>
                  <div className="flex flex-wrap gap-1">
                    {issue.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          borderColor: tag.color,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </DetailField>
              )}

              <Separator />

              {/* Metadata */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Creado:{' '}
                  {format(new Date(issue.createdAt), "d MMM yyyy HH:mm", {
                    locale: es,
                  })}
                </p>
                <p>
                  Actualizado:{' '}
                  {format(new Date(issue.updatedAt), "d MMM yyyy HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function DetailField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-1.5 w-32 shrink-0 pt-0.5">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
