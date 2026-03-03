'use client';

import { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  Check,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type PreviewSize = 'desktop' | 'tablet' | 'mobile';

const PREVIEW_SIZES: { key: PreviewSize; label: string; icon: React.ElementType; width: string }[] = [
  { key: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { key: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { key: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

export default function EmbedTestPage() {
  const [orgId, setOrgId] = useState('1');
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const formUrl = `${baseUrl}/submit-ticket?orgId=${orgId}`;

  const embedSnippet = `<iframe
  src="${formUrl}"
  width="100%"
  height="700"
  style="border: none; border-radius: 8px;"
  title="Formulario de soporte"
></iframe>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentSize = PREVIEW_SIZES.find((s) => s.key === previewSize)!;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Embed Test
                </h1>
                <p className="text-xs text-muted-foreground">
                  Prueba el formulario publico de tickets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Code2 className="size-3 mr-1" />
                Embebible
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href={formUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Abrir standalone
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* Config row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="org-id-input">Organization ID</Label>
            <Input
              id="org-id-input"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              placeholder="1"
              className="w-32"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
            {PREVIEW_SIZES.map((size) => {
              const Icon = size.icon;
              return (
                <button
                  key={size.key}
                  onClick={() => setPreviewSize(size.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    previewSize === size.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  {size.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <span className="text-xs text-muted-foreground">
            URL: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{formUrl}</code>
          </span>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Vista previa</CardTitle>
                <CardDescription className="text-xs">
                  Asi se vera el formulario embebido en tu sitio web
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {currentSize.label} — {currentSize.width}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="mx-auto overflow-hidden rounded-lg border bg-white dark:bg-zinc-950 transition-all duration-300"
              style={{ maxWidth: currentSize.width }}
            >
              <iframe
                src={formUrl}
                width="100%"
                height="700"
                style={{ border: 'none' }}
                title="Formulario de soporte - Preview"
              />
            </div>
          </CardContent>
        </Card>

        {/* Code snippet */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Codigo de integracion</CardTitle>
                <CardDescription className="text-xs">
                  Copia este snippet HTML y pegalo en tu pagina web
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-green-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
              <code>{embedSnippet}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Usage notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Notas de uso</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                El parametro <code className="bg-muted px-1 py-0.5 rounded text-xs">orgId</code> identifica la
                organizacion que recibira los tickets.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                El formulario funciona sin autenticacion — ideal para usuarios
                externos.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Ajusta el <code className="bg-muted px-1 py-0.5 rounded text-xs">height</code> del
                iframe segun el contenido de tu pagina.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                El formulario es responsive y se adapta al ancho del contenedor.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
