'use client';

import { useState } from 'react';
import {
  Key,
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  MoreHorizontal,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
} from '@/modules/organization/hooks/use-organization';

// ─── Constants ───────────────────────────────────────────────────────────────

const API_SCOPES = [
  { id: 'projects:read', label: 'Proyectos — Lectura' },
  { id: 'projects:write', label: 'Proyectos — Escritura' },
  { id: 'issues:read', label: 'Incidencias — Lectura' },
  { id: 'issues:write', label: 'Incidencias — Escritura' },
  { id: 'members:read', label: 'Miembros — Lectura' },
  { id: 'members:write', label: 'Miembros — Escritura' },
  { id: 'reports:read', label: 'Reportes — Lectura' },
];

const WEBHOOK_EVENTS = [
  { id: 'issue.created', label: 'issue.created' },
  { id: 'issue.updated', label: 'issue.updated' },
  { id: 'issue.deleted', label: 'issue.deleted' },
  { id: 'issue.assigned', label: 'issue.assigned' },
  { id: 'sprint.started', label: 'sprint.started' },
  { id: 'sprint.completed', label: 'sprint.completed' },
  { id: 'member.added', label: 'member.added' },
  { id: 'member.removed', label: 'member.removed' },
  { id: 'project.created', label: 'project.created' },
  { id: 'project.archived', label: 'project.archived' },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── API Keys Section ─────────────────────────────────────────────────────────

function ApiKeysSection({ orgId }: { orgId: number }) {
  const { data: keys = [], isLoading } = useApiKeys(orgId);
  const createKey = useCreateApiKey(orgId);
  const revokeKey = useRevokeApiKey(orgId);

  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    createKey.mutate(
      { name: newKeyName.trim(), scopes: selectedScopes },
      {
        onSuccess: (result) => {
          setCreatedKey(result.plaintext);
          setNewKeyName('');
          setSelectedScopes([]);
        },
      },
    );
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setCreatedKey(null);
    setNewKeyName('');
    setSelectedScopes([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="size-4" />
              API Keys
            </CardTitle>
            <CardDescription>
              Genera claves de API para acceder a la plataforma programaticamente.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nueva clave
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
            <Key className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Sin API keys</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Genera una clave para integrar aplicaciones externas.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Prefijo</TableHead>
                  <TableHead>Alcances</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Ultimo uso</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium text-sm">{key.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{key.prefix}...</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {key.scopes.length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{key.scopes.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(key.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : '—'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revocar API key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta accion es irreversible. La clave &quot;{key.name}&quot; quedara invalidada inmediatamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => revokeKey.mutate(key.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Revocar clave
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create API Key Dialog */}
      <Dialog open={createOpen} onOpenChange={handleCloseCreate}>
        <DialogContent>
          {createdKey ? (
            <>
              <DialogHeader>
                <DialogTitle>API key generada</DialogTitle>
                <DialogDescription>
                  Copia esta clave ahora. No podras verla de nuevo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
                  <code className="flex-1 text-xs font-mono break-all">{createdKey}</code>
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={handleCopy}>
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Guarda esta clave en un lugar seguro. Por razones de seguridad, no se mostrara de nuevo.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseCreate}>Listo</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Generar nueva API key</DialogTitle>
                <DialogDescription>
                  Crea una nueva clave para acceder a la API de la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="key-name">Nombre de la clave</Label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ej: Integracion CI/CD, App movil..."
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alcances (permisos)</Label>
                  <div className="space-y-2 max-h-52 overflow-y-auto rounded-md border p-3">
                    {API_SCOPES.map((scope) => (
                      <div key={scope.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`scope-${scope.id}`}
                          checked={selectedScopes.includes(scope.id)}
                          onCheckedChange={() => toggleScope(scope.id)}
                        />
                        <Label htmlFor={`scope-${scope.id}`} className="font-mono text-xs cursor-pointer">
                          {scope.id}
                        </Label>
                        <span className="text-xs text-muted-foreground">— {scope.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseCreate}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!newKeyName.trim() || createKey.isPending}>
                  {createKey.isPending ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
                  Generar clave
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── Webhooks Section ─────────────────────────────────────────────────────────

function WebhooksSection({ orgId }: { orgId: number }) {
  const { data: hooks = [], isLoading } = useWebhooks(orgId);
  const createHook = useCreateWebhook(orgId);
  const deleteHook = useDeleteWebhook(orgId);

  const [createOpen, setCreateOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleCreate = () => {
    if (!webhookUrl.trim() || selectedEvents.length === 0) return;
    createHook.mutate(
      { url: webhookUrl.trim(), events: selectedEvents },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setWebhookUrl('');
          setSelectedEvents([]);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Webhook className="size-4" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Recibe notificaciones en tiempo real en tus sistemas externos.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Añadir webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : hooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
            <Zap className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Sin webhooks configurados</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Añade un endpoint para recibir eventos de la plataforma.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Eventos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ultima activacion</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {hooks.map((hook) => (
                  <TableRow key={hook.id}>
                    <TableCell className="font-mono text-xs max-w-48">
                      <span className="truncate block">{hook.url}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hook.events.slice(0, 2).map((e) => (
                          <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                        ))}
                        {hook.events.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{hook.events.length - 2} mas</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={hook.isActive ? 'default' : 'secondary'}
                        className={hook.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                      >
                        {hook.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {hook.lastTriggeredAt ? formatDate(hook.lastTriggeredAt) : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}}>
                            <Zap className="size-4" />
                            Probar webhook
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteHook.mutate(hook.id)}
                          >
                            <Trash2 className="size-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create Webhook Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir webhook</DialogTitle>
            <DialogDescription>
              Configura un endpoint para recibir eventos de la organizacion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="webhook-url">URL del endpoint</Label>
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://mi-app.com/api/webhooks/eproject"
                type="url"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Eventos a suscribir</Label>
              <div className="space-y-2 max-h-52 overflow-y-auto rounded-md border p-3">
                {WEBHOOK_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`event-${event.id}`}
                      checked={selectedEvents.includes(event.id)}
                      onCheckedChange={() => toggleEvent(event.id)}
                    />
                    <Label htmlFor={`event-${event.id}`} className="font-mono text-xs cursor-pointer">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedEvents.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''} seleccionado{selectedEvents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={!webhookUrl.trim() || selectedEvents.length === 0 || createHook.isPending}
            >
              {createHook.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Añadir webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdvancedPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  return (
    <div className="flex-1 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Avanzado</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Integraciones programaticas: API keys para acceso directo y webhooks para eventos en tiempo real.
        </p>
      </div>
      <div className="space-y-6">
        <ApiKeysSection orgId={orgId} />
        <WebhooksSection orgId={orgId} />
      </div>
    </div>
  );
}
