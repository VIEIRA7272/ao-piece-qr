import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Video, Download, ExternalLink, QrCode, ArrowLeft } from "lucide-react";
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

              <div className="space-y-5">
                <div className="p-5 bg-secondary/50 rounded-xl border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Link da Landing Page</span>
                    <Button variant="ghost" size="sm" onClick={() => window.open(result.landingUrl, '_blank')} className="hover-lift">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground break-all font-mono">{result.landingUrl}</p>
                </div>

                <div className="space-y-5">
                  {result.pdfFinalUrl && (
                    <div className="border border-border/30 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-4 bg-card border-b border-border/30">
                        <h3 className="text-sm font-medium text-foreground">Prévia do PDF com QR Code</h3>
                      </div>
                      <iframe
                        src={result.pdfFinalUrl}
                        className="w-full h-[500px]"
                        title="Prévia do PDF"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full hover-lift" onClick={() => window.open(result.qrCodeUrl, '_blank')}>
                      <QrCode className="h-4 w-4 mr-2" />QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover-lift" 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.pdfFinalUrl;
                        link.download = `peca_${result.slug}.pdf`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />Baixar PDF
                    </Button>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold hover:shadow-lg transition-all" onClick={() => setResult(null)}>
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
            <h1 className="text-3xl font-serif text-center mb-4 text-gold font-semibold">Enviar Peça Processual</h1>
            <p className="text-muted-foreground text-center mb-10 font-light">Faça upload do PDF e vídeo explicativo</p>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <Label htmlFor="processo" className="text-foreground font-medium">Número do Processo *</Label>
                <Input id="processo" type="text" placeholder="Ex: 0000000-00.0000.0.00.0000" value={processo} onChange={(e) => setProcesso(e.target.value)} required className="mt-2 bg-secondary/50 border-border/50 text-foreground" />
              </div>

              <div>
                <Label htmlFor="titulo" className="text-foreground font-medium">Título da Peça (opcional)</Label>
                <Input id="titulo" type="text" placeholder="Ex: Contestação, Apelação..." value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mt-2 bg-secondary/50 border-border/50 text-foreground" />
              </div>

              <div>
                <Label htmlFor="advogado" className="text-foreground font-medium">Nome do Advogado (opcional)</Label>
                <Input id="advogado" type="text" placeholder="Nome do advogado responsável" value={advogadoNome} onChange={(e) => setAdvogadoNome(e.target.value)} className="mt-2 bg-secondary/50 border-border/50 text-foreground" />
              </div>

              <div>
                <Label htmlFor="pdf" className="text-foreground font-medium">PDF da Peça *</Label>
                <div className="mt-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    required
                    className="bg-secondary/50 border-border/50 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {pdfFile && <p className="text-xs text-muted-foreground mt-2 font-light">Arquivo: {pdfFile.name}</p>}
              </div>

              <div>
                <Label htmlFor="video" className="text-foreground font-medium">Vídeo Explicativo *</Label>
                <div className="mt-2">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    required
                    className="bg-secondary/50 border-border/50 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {videoFile && <p className="text-xs text-muted-foreground mt-2 font-light">Arquivo: {videoFile.name}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 shadow-gold hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Processar Peça
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Enviar;
