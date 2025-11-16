import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Video, Download, ExternalLink, QrCode, ArrowLeft, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

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
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 hover-lift">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="p-10 bg-card border-border/50 shadow-soft">
              <div className="text-center mb-8">
                <div className="inline-block p-5 rounded-2xl bg-primary/10 mb-6">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-serif text-gold mb-3 font-semibold">Processado com Sucesso</h2>
                <p className="text-muted-foreground font-light">Sua peça está pronta para compartilhar com o cliente</p>
              </div>

              <div className="space-y-6">
                {/* Link da Landing Page */}
                <div className="p-6 bg-secondary/50 rounded-xl border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Link para o Cliente</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(result.landingUrl);
                        toast.success("Link copiado!");
                      }}
                      className="hover-lift"
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground break-all font-mono bg-background/50 p-3 rounded">
                    {result.landingUrl}
                  </p>
                </div>

                {/* Ações principais */}
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full hover-lift flex-col h-auto py-4"
                    onClick={() => window.open(result.landingUrl, '_blank')}
                  >
                    <ExternalLink className="h-5 w-5 mb-2" />
                    <span className="text-xs">Ver Landing</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover-lift flex-col h-auto py-4"
                    onClick={() => window.open(result.pdfFinalUrl, '_blank')}
                  >
                    <FileText className="h-5 w-5 mb-2" />
                    <span className="text-xs">Ver PDF</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover-lift flex-col h-auto py-4"
                    onClick={() => window.open(result.qrCodeUrl, '_blank')}
                  >
                    <QrCode className="h-5 w-5 mb-2" />
                    <span className="text-xs">Ver QR Code</span>
                  </Button>
                </div>

                {/* Botão de download destacado */}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold hover:shadow-lg transition-all py-6"
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
                  <Download className="h-5 w-5 mr-2" />
                  Baixar PDF com QR Code
                </Button>

                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setResult(null)}
                >
                  Enviar Nova Peça
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 hover-lift">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-center">
            <Logo />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Summary */}
          <Card className="p-6 bg-card border-border/50 shadow-soft h-fit">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              RESUMO DO PROCESSO
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Cliente</p>
                <p className="text-base font-medium text-foreground">
                  {titulo || "Empresa Exemplo Ltda"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Tipo de Ação</p>
                <p className="text-base font-medium text-foreground">
                  {processo || "Ação de Cobrança"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Status Atual</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-xs font-medium text-primary">Aguardando Protocolo</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                PEÇA JURÍDICA
              </h3>
              
              {pdfFile ? (
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPdfFile(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center p-4 bg-secondary/30 rounded-lg border border-dashed border-border/50">
                  <p className="text-xs text-muted-foreground">Nenhum arquivo selecionado</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !pdfFile || !videoFile || !processo}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 shadow-gold hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Confirmar Peça
                </>
              )}
            </Button>
          </Card>

          {/* Right Column - Video and File Upload */}
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border/50 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-foreground" />
                <h2 className="text-base font-medium text-foreground">
                  Vídeo Explicativo da Peça
                </h2>
              </div>

              {videoFile ? (
                <div className="space-y-4">
                  <video
                    src={URL.createObjectURL(videoFile)}
                    controls
                    className="w-full rounded-lg bg-black"
                  />
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-auto px-4 py-2"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload do vídeo explicativo
                  </p>
                  <Label
                    htmlFor="video"
                    className="inline-flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Vídeo
                  </Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              )}
            </Card>

            <Card className="p-6 bg-card border-border/50 shadow-soft">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                UPLOAD DE DOCUMENTOS
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="processo" className="text-foreground font-medium text-sm mb-2 block">
                    Número do Processo *
                  </Label>
                  <Input
                    id="processo"
                    type="text"
                    placeholder="Ex: 0000000-00.0000.0.00.0000"
                    value={processo}
                    onChange={(e) => setProcesso(e.target.value)}
                    required
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="titulo" className="text-foreground font-medium text-sm mb-2 block">
                    Título da Peça (opcional)
                  </Label>
                  <Input
                    id="titulo"
                    type="text"
                    placeholder="Ex: Contestação, Apelação..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="advogado" className="text-foreground font-medium text-sm mb-2 block">
                    Nome do Advogado (opcional)
                  </Label>
                  <Input
                    id="advogado"
                    type="text"
                    placeholder="Nome do advogado responsável"
                    value={advogadoNome}
                    onChange={(e) => setAdvogadoNome(e.target.value)}
                    className="bg-secondary/50 border-border/50 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="pdf" className="text-foreground font-medium text-sm mb-2 block">
                    PDF da Peça *
                  </Label>
                  <Label
                    htmlFor="pdf"
                    className="flex items-center justify-center w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-md cursor-pointer hover:bg-secondary/70 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {pdfFile ? pdfFile.name : "Selecionar PDF"}
                    </span>
                  </Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    required
                    className="hidden"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enviar;
