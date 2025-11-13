-- Criar tabela para armazenar informações das peças processuais
CREATE TABLE public.videos_pecas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  processo TEXT NOT NULL,
  titulo_peca TEXT,
  advogado_nome TEXT,
  video_url TEXT NOT NULL,
  pdf_original_url TEXT NOT NULL,
  pdf_final_url TEXT,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para busca por slug
CREATE INDEX idx_videos_pecas_slug ON public.videos_pecas(slug);

-- Habilitar RLS
ALTER TABLE public.videos_pecas ENABLE ROW LEVEL SECURITY;

-- Permitir que todos vejam as peças (para clientes)
CREATE POLICY "Peças são visíveis para todos"
ON public.videos_pecas
FOR SELECT
USING (true);

-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('videos', 'videos', true),
  ('pdfs', 'pdfs', true),
  ('qrcodes', 'qrcodes', true);

-- Policies para storage de vídeos (público)
CREATE POLICY "Vídeos são públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Upload de vídeos permitido"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Policies para storage de PDFs (público)
CREATE POLICY "PDFs são públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pdfs');

CREATE POLICY "Upload de PDFs permitido"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'pdfs');

-- Policies para storage de QR Codes (público)
CREATE POLICY "QR Codes são públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'qrcodes');

CREATE POLICY "Upload de QR Codes permitido"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'qrcodes');