import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Video, ExternalLink, QrCode, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedDownload } from "@/components/ui/animated-download";

interface ProcessResult {
  slug: string;
  landingUrl: string;
  qrCodeUrl: string;
  pdfFinalUrl: string;
}

const Enviar = () => {
  const navigate = useNavigate();
  const [processo, setProcesso] = useState("");
  const [titulo, setTitulo] = useState("");
  const [advogadoNome, setAdvogadoNome] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!processo || !pdfFile || !videoFile) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('processo', processo);
      if (titulo) formData.append('titulo', titulo);
      if (advogadoNome) formData.append('advogado_nome', advogadoNome);
      formData.append('appUrl', window.location.origin);
      formData.append('pdf', pdfFile);
      formData.append('video', videoFile);

      const { data, error } = await supabase.functions.invoke('process-peca', {
        body: formData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      toast.success("Peça processada com sucesso!");
      
      setProcesso("");
      setTitulo("");
      setAdvogadoNome("");
      setPdfFile(null);
      setVideoFile(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar peça");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-10">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Message */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-serif font-bold">Documento Processado!</h1>
              <p className="text-muted-foreground">
                O QR Code foi inserido automaticamente na primeira página do seu PDF
              </p>
            </div>

            {/* Preview do PDF com QR Code incorporado */}
            <Card className="p-6 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">📄 PDF Final com QR Code</h2>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Pronto para uso
                </div>
              </div>
              
              <div className="relative w-full bg-muted/30 rounded-lg overflow-hidden border-2 border-primary/20 mb-4" style={{ aspectRatio: '8.5/11' }}>
                <iframe
                  src={`${result.pdfFinalUrl}#view=FitH`}
                  className="w-full h-full border-0"
                  title="PDF com QR Code incorporado"
                />
              </div>

              <p className="text-sm text-center text-muted-foreground mb-4">
                ⬇️ O QR Code está no canto inferior direito da primeira página
              </p>

              {/* Download Button - Destaque Principal */}
              <Button 
                className="w-full h-14 text-lg font-semibold gap-2"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result.pdfFinalUrl;
                  link.download = `peca_${result.slug}.pdf`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success("Download iniciado!");
                }}
              >
                <FileText className="h-5 w-5" />
                Baixar PDF Final
              </Button>
            </Card>

            {/* Informações Adicionais */}
            <Card className="p-6 bg-card space-y-4">
              <h3 className="font-semibold text-center">🔗 Link da Landing Page</h3>
              <p className="text-sm text-muted-foreground text-center">
                O QR Code do documento leva para este link, onde o vídeo é exibido
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={result.landingUrl}
                  readOnly
                  className="font-mono text-sm bg-muted/50"
                />
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(result.landingUrl);
                    toast.success("Link copiado!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Botões secundários */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  variant="secondary"
                  onClick={() => window.open(result.landingUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Landing Page
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => window.open(result.qrCodeUrl, '_blank')}
                  className="gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Ver QR Code
                </Button>
              </div>
            </Card>

            {/* Animated Download Component */}
            <div className="flex justify-center py-4">
              <AnimatedDownload 
                isAnimating={false}
                className="w-full"
              />
            </div>

            {/* Nova Peça */}
            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={() => setResult(null)}
            >
              Enviar Nova Peça
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-center">
            <Logo />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-8">Nova Peça Processual</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Process Info Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="processo">Número do Processo *</Label>
                  <Input
                    id="processo"
                    value={processo}
                    onChange={(e) => setProcesso(e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Peça</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Petição Inicial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advogado">Nome do Advogado</Label>
                  <Input
                    id="advogado"
                    value={advogadoNome}
                    onChange={(e) => setAdvogadoNome(e.target.value)}
                    placeholder="Ex: Dr. João Silva"
                  />
                </div>
              </div>

              {/* File Uploads Section */}
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                {/* PDF Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Original *
                  </Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      required
                    />
                  </div>
                  {pdfFile && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {pdfFile.name}
                    </p>
                  )}
                </div>

                {/* Video Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vídeo Explicativo *
                  </Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      required
                    />
                  </div>
                  {videoFile && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {videoFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-6 flex justify-center">
                {loading ? (
                  <AnimatedDownload isAnimating={true} className="w-full max-w-md" />
                ) : (
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full md:w-auto px-12"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Processar Peça
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Enviar;
