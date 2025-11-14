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
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-card border-border">
              <div className="text-center mb-6">
                <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-serif text-gold mb-2">Peça Processada com Sucesso!</h2>
                <p className="text-muted-foreground">Sua peça foi processada e está pronta para compartilhar</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Link da Landing Page</span>
                    <Button variant="ghost" size="sm" onClick={() => window.open(result.landingUrl, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground break-all">{result.landingUrl}</p>
                </div>

                <div className="space-y-4">
                  {result.pdfFinalUrl && (
                    <div className="border border-border rounded-lg overflow-hidden bg-secondary">
                      <div className="p-3 bg-card border-b border-border">
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
                    <Button variant="outline" className="w-full" onClick={() => window.open(result.qrCodeUrl, '_blank')}>
                      <QrCode className="h-4 w-4 mr-2" />QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
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

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setResult(null)}>
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
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-center">
            <Logo />
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-card border-border">
            <h1 className="text-3xl font-serif text-center mb-2 text-gold">Enviar Peça Processual</h1>
            <p className="text-muted-foreground text-center mb-8">Faça upload do PDF e vídeo explicativo</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="processo" className="text-foreground">Número do Processo *</Label>
                <Input id="processo" type="text" placeholder="Ex: 0000000-00.0000.0.00.0000" value={processo} onChange={(e) => setProcesso(e.target.value)} required className="mt-2 bg-secondary border-border text-foreground" />
              </div>

              <div>
                <Label htmlFor="titulo" className="text-foreground">Título da Peça (opcional)</Label>
                <Input id="titulo" type="text" placeholder="Ex: Contestação, Apelação..." value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mt-2 bg-secondary border-border text-foreground" />
              </div>

              <div>
                <Label htmlFor="advogado" className="text-foreground">Nome do Advogado (opcional)</Label>
                <Input id="advogado" type="text" placeholder="Nome do advogado responsável" value={advogadoNome} onChange={(e) => setAdvogadoNome(e.target.value)} className="mt-2 bg-secondary border-border text-foreground" />
              </div>

              <div>
                <Label htmlFor="pdf" className="text-foreground">PDF da Peça *</Label>
                <div className="mt-2">
                  <label htmlFor="pdf" className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary">
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{pdfFile ? pdfFile.name : "Clique para selecionar o PDF"}</p>
                    </div>
                    <input id="pdf" type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="video" className="text-foreground">Vídeo Explicativo *</Label>
                <div className="mt-2">
                  <label htmlFor="video" className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary">
                    <div className="text-center">
                      <Video className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{videoFile ? videoFile.name : "Clique para selecionar o vídeo"}</p>
                    </div>
                    <input id="video" type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {loading ? <span className="flex items-center gap-2"><Upload className="animate-spin h-4 w-4" />Processando...</span> : "Enviar Peça"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Enviar;
