'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, HardDrive, Database } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useStorageConfig,
  useUpdateStorageConfig,
} from '@/modules/organization/hooks/use-organization';

const fileTypeOptions = [
  { id: 'images', label: 'Imagenes', description: 'PNG, JPG, GIF, SVG, WEBP' },
  { id: 'documents', label: 'Documentos', description: 'PDF, DOC, DOCX, TXT, RTF' },
  { id: 'spreadsheets', label: 'Hojas de calculo', description: 'XLS, XLSX, CSV' },
  { id: 'presentations', label: 'Presentaciones', description: 'PPT, PPTX' },
  { id: 'archives', label: 'Archivos comprimidos', description: 'ZIP, RAR, 7Z, TAR' },
  { id: 'audio', label: 'Audio', description: 'MP3, WAV, OGG' },
  { id: 'video', label: 'Video', description: 'MP4, MOV, AVI, WEBM' },
  { id: 'code', label: 'Codigo fuente', description: 'JS, TS, PY, JSON, XML' },
];

export default function StoragePage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: storageConfig, isLoading, isError } = useStorageConfig(orgId);
  const updateStorage = useUpdateStorageConfig(orgId);

  const [provider, setProvider] = useState('supabase');
  const [bucketName, setBucketName] = useState('');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState('10');
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([
    'images',
    'documents',
  ]);
  const [totalQuotaGb, setTotalQuotaGb] = useState('10');

  useEffect(() => {
    if (storageConfig) {
      setProvider(storageConfig.provider);
      setBucketName(storageConfig.bucketName);
      setMaxFileSizeMb(String(storageConfig.maxFileSizeMb));
      setAllowedFileTypes(storageConfig.allowedFileTypes);
      setTotalQuotaGb(String(storageConfig.totalQuotaGb));
    }
  }, [storageConfig]);

  const handleToggleFileType = (typeId: string) => {
    setAllowedFileTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId],
    );
  };

  const handleSave = () => {
    updateStorage.mutate({
      provider,
      bucketName,
      maxFileSizeMb: Number(maxFileSizeMb),
      allowedFileTypes,
      totalQuotaGb: Number(totalQuotaGb),
    });
  };

  const usedGb = storageConfig?.usedStorageGb ?? 0;
  const quotaGb = Number(totalQuotaGb) || 1;
  const usagePercent = Math.min((usedGb / quotaGb) * 100, 100);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Error al cargar la configuracion de almacenamiento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Almacenamiento
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configura el almacenamiento de archivos de tu organizacion.
          </p>
        </div>

        <div className="space-y-6">
          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  <Database className="size-4" />
                  Uso de almacenamiento
                </div>
              </CardTitle>
              <CardDescription>
                Espacio utilizado por tu organizacion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {usedGb.toFixed(2)} GB de {quotaGb} GB utilizados
                </span>
                <span className="font-medium">{usagePercent.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              {usagePercent > 90 && (
                <p className="text-xs text-destructive">
                  Tu almacenamiento esta casi lleno. Considera aumentar la
                  cuota o eliminar archivos innecesarios.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Provider & Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  <HardDrive className="size-4" />
                  Configuracion
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storage-provider">Proveedor</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supabase">
                        Supabase Storage
                      </SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">
                        Google Cloud Storage
                      </SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bucket-name">Nombre del bucket</Label>
                  <Input
                    id="bucket-name"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    placeholder="my-org-files"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">
                    Tamano maximo por archivo (MB)
                  </Label>
                  <Input
                    id="max-file-size"
                    value={maxFileSizeMb}
                    onChange={(e) => setMaxFileSizeMb(e.target.value)}
                    type="number"
                    min="1"
                    max="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-quota">Cuota total (GB)</Label>
                  <Input
                    id="total-quota"
                    value={totalQuotaGb}
                    onChange={(e) => setTotalQuotaGb(e.target.value)}
                    type="number"
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allowed File Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Tipos de archivo permitidos
              </CardTitle>
              <CardDescription>
                Selecciona los tipos de archivo que los miembros pueden subir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {fileTypeOptions.map((fileType) => {
                  const isChecked = allowedFileTypes.includes(fileType.id);
                  return (
                    <label
                      key={fileType.id}
                      className="flex items-start gap-3 rounded-md border px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleToggleFileType(fileType.id)
                        }
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {fileType.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fileType.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Fixed save bar ──────────────────────────────────────── */}
        <div
          className="fixed bottom-0 right-0 z-20 border-t bg-white/80 backdrop-blur-sm dark:bg-card/80"
          style={{ left: 'var(--sidebar-width)' }}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Los cambios no se guardan automaticamente.
            </p>
            <Button
              onClick={handleSave}
              disabled={updateStorage.isPending}
            >
              {updateStorage.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar cambios
            </Button>
          </div>
        </div>
    </div>
  );
}
