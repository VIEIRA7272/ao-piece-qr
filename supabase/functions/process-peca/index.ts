import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar slug único de 6 caracteres
function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const processo = formData.get('processo') as string;
    const titulo = formData.get('titulo') as string | null;
    const advogadoNome = formData.get('advogado_nome') as string | null;
    const appUrl = formData.get('appUrl') as string;
    const pdfFile = formData.get('pdf') as File;
    const videoFile = formData.get('video') as File;

    if (!processo || !pdfFile || !videoFile || !appUrl) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Iniciando processamento...');

    // Gerar slug único
    let slug = generateSlug();
    let slugExists = true;
    
    while (slugExists) {
      const { data } = await supabase
        .from('videos_pecas')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!data) {
        slugExists = false;
      } else {
        slug = generateSlug();
      }
    }

    console.log('Slug gerado:', slug);

    // 1. Upload do vídeo
    const videoExt = videoFile.name.split('.').pop();
    const videoPath = `${slug}.${videoExt}`;
    const videoBytes = await videoFile.arrayBuffer();
    
    const { error: videoError } = await supabase.storage
      .from('videos')
      .upload(videoPath, videoBytes, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (videoError) {
      console.error('Erro ao fazer upload do vídeo:', videoError);
      throw new Error('Erro ao fazer upload do vídeo');
    }

    const { data: { publicUrl: videoUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(videoPath);

    console.log('Vídeo enviado:', videoUrl);

    // 2. Upload do PDF original
    const pdfOriginalPath = `original/${slug}.pdf`;
    const pdfBytes = await pdfFile.arrayBuffer();
    
    const { error: pdfOriginalError } = await supabase.storage
      .from('pdfs')
      .upload(pdfOriginalPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (pdfOriginalError) {
      console.error('Erro ao fazer upload do PDF original:', pdfOriginalError);
      throw new Error('Erro ao fazer upload do PDF');
    }

    const { data: { publicUrl: pdfOriginalUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(pdfOriginalPath);

    console.log('PDF original enviado:', pdfOriginalUrl);

    // 3. Gerar QR Code usando API externa (qr-server)
    const landingUrl = `${appUrl}/v/${slug}`;
    
    // Usar API pública do qr-server para gerar o QR Code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(landingUrl)}`;
    const qrResponse = await fetch(qrApiUrl);
    
    if (!qrResponse.ok) {
      throw new Error('Erro ao gerar QR Code');
    }
    
    const qrCodeBytes = new Uint8Array(await qrResponse.arrayBuffer());

    // Upload do QR Code
    const qrCodePath = `${slug}.png`;
    const { error: qrError } = await supabase.storage
      .from('qrcodes')
      .upload(qrCodePath, qrCodeBytes, {
        contentType: 'image/png',
        upsert: false,
      });

    if (qrError) {
      console.error('Erro ao fazer upload do QR Code:', qrError);
      throw new Error('Erro ao fazer upload do QR Code');
    }

    const { data: { publicUrl: qrCodeUrl } } = supabase.storage
      .from('qrcodes')
      .getPublicUrl(qrCodePath);

    console.log('QR Code gerado:', qrCodeUrl);

    // 4. Processar PDF: inserir QR Code
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Incorporar imagem do QR Code no PDF
    const qrImage = await pdfDoc.embedPng(qrCodeBytes);
    const qrSize = 80; // Tamanho do QR Code no PDF

    // Adicionar QR Code no canto inferior direito da primeira página
    const { width, height } = firstPage.getSize();
    firstPage.drawImage(qrImage, {
      x: width - qrSize - 30,
      y: 30,
      width: qrSize,
      height: qrSize,
    });

    // Salvar PDF modificado
    const pdfFinalBytes = await pdfDoc.save();
    const pdfFinalPath = `final/${slug}.pdf`;

    const { error: pdfFinalError } = await supabase.storage
      .from('pdfs')
      .upload(pdfFinalPath, pdfFinalBytes, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (pdfFinalError) {
      console.error('Erro ao fazer upload do PDF final:', pdfFinalError);
      throw new Error('Erro ao fazer upload do PDF final');
    }

    const { data: { publicUrl: pdfFinalUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(pdfFinalPath);

    console.log('PDF final gerado:', pdfFinalUrl);

    // 5. Salvar registro no banco
    const { error: dbError } = await supabase
      .from('videos_pecas')
      .insert({
        slug,
        processo,
        titulo_peca: titulo || null,
        advogado_nome: advogadoNome || null,
        video_url: videoUrl,
        pdf_original_url: pdfOriginalUrl,
        pdf_final_url: pdfFinalUrl,
        qr_code_url: qrCodeUrl,
      });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      throw new Error('Erro ao salvar no banco de dados');
    }

    console.log('Registro salvo no banco');

    // 6. Retornar resultado
    return new Response(
      JSON.stringify({
        success: true,
        slug,
        landingUrl,
        qrCodeUrl,
        pdfFinalUrl,
        videoUrl,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no processamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar peça';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
