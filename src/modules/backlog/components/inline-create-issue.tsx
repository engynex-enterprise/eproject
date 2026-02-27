'use client';

import { useState, useRef } from 'react';
import {
  Bug,
  BookOpen,
  CheckSquare,
  Zap,
  User,
  CornerDownLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BacklogIssueType } from '../services/backlog.service';

const issueTypeIcons: Record<string, React.ElementType> = {
  Epic: Zap,
  Story: BookOpen,
  Task: CheckSquare,
  Bug: Bug,
  'Sub-task': CheckSquare,
};

const issueTypeColors: Record<string, string> = {
  Epic: 'text-purple-500',
  Story: 'text-green-500',
  Task: 'text-blue-500',
  Bug: 'text-red-500',
  'Sub-task': 'text-gray-500',
};

interface InlineCreateIssueProps {
  onCreateIssue: (title: string, issueTypeId: number) => void;
  isPending?: boolean;
  issueTypes: BacklogIssueType[];
}

export function InlineCreateIssue({
  onCreateIssue,
  isPending,
  issueTypes,
}: InlineCreateIssueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<BacklogIssueType | null>(
    () => issueTypes.find((t) => t.isDefault) ?? issueTypes[0] ?? null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed || !selectedType) return;
    onCreateIssue(trimmed, selectedType.id);
    setTitle('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setTitle('');
      setIsEditing(false);
    }
  };

  const SelectedIcon = selectedType
    ? (issueTypeIcons[selectedType.name] ?? CheckSquare)
    : CheckSquare;
  const selectedColor = selectedType
    ? (issueTypeColors[selectedType.name] ?? 'text-gray-500')
    : 'text-gray-500';

  if (!isEditing) {
    return (
      <button
        onClick={() => {
          setIsEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center gap-1.5 border-t px-3 py-2 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
      >
        <Checkbox disabled className="size-3.5 opacity-40" />
        <span className="text-xs">+ Crear incidencia</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 border-t border-primary/30 bg-primary/[0.02] px-3 py-1.5 ring-1 ring-inset ring-primary/20">
      <Checkbox disabled className="size-3.5 opacity-40" />

      {/* Issue type dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 hover:bg-muted/50 transition-colors">
            <SelectedIcon className={cn('size-4', selectedColor)} />
            <ChevronDown className="size-2.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {issueTypes
            .filter((t) => !t.isSubtask)
            .map((type) => {
              const Icon = issueTypeIcons[type.name] ?? CheckSquare;
              const color = issueTypeColors[type.name] ?? 'text-gray-500';
              return (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className="gap-2"
                >
                  <Icon className={cn('size-4', color)} />
                  <span>{type.name}</span>
                </DropdownMenuItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) {
            setIsEditing(false);
          }
        }}
        placeholder="Describe lo que hay que hacer..."
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        autoFocus
        disabled={isPending}
      />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          disabled
        >
          <User className="size-3.5" />
        </Button>

        <Button
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={handleSubmit}
          disabled={!title.trim() || !selectedType || isPending}
        >
          Crear
          <CornerDownLeft className="size-3" />
        </Button>
      </div>
    </div>
  );
}
