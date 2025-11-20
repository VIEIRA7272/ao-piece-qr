import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoPeca {
  slug: string;
  processo: string;
  titulo_peca: string | null;
  video_url: string;
  pdf_final_url: string | null;
  created_at: string;
}

const VideoLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const [peca, setPeca] = useState<VideoPeca | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeca = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from("videos_pecas")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast.error("Peça não encontrada");
        } else {
          setPeca(data);
        }
      } catch (error) {
        console.error("Erro ao buscar peça:", error);
        toast.error("Erro ao carregar peça");
      } finally {
        setLoading(false);
      }
    };

    fetchPeca();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!peca) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif mb-2">Peça não encontrada</h2>
          <p className="text-muted-foreground">
            O link que você acessou não corresponde a nenhuma peça processual.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <Logo />
            <p className="text-sm text-gold font-light tracking-wide">
              Advocacia Especializada em Direito Bancário
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Video Card */}
          <Card className="p-8 bg-card border-border shadow-soft">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-serif text-gold mb-3 font-bold">
                {peca.titulo_peca || "Peça Processual"}
              </h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="font-light">Processo: <span className="font-mono text-foreground">{peca.processo}</span></span>
              </div>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
              <video
                controls
                className="w-full h-full"
                src={peca.video_url}
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>

            {peca.pdf_final_url && (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-primary-foreground shadow-gold hover:shadow-xl transition-all font-semibold"
                onClick={() => window.open(peca.pdf_final_url!, "_blank")}
              >
                <Download className="h-5 w-5 mr-2" />
                Baixar Peça em PDF
              </Button>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-8 bg-card border-border shadow-soft">
            <h2 className="text-2xl font-serif text-gold mb-4 font-bold text-center">
              Sobre o Escritório
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-center">
              A Almeida & Oliveira Advogados é um escritório especializado em Direito Bancário, 
              oferecendo soluções jurídicas personalizadas com foco em excelência e resultados.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/40 border border-border/30">
                <span className="text-gold text-xl">📞</span>
                <div>
                  <p className="font-semibold text-foreground">Telefone</p>
                  <p className="text-muted-foreground text-sm">(11) 98765-4321</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/40 border border-border/30">
                <span className="text-gold text-xl">📧</span>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p className="text-muted-foreground text-sm">contato@almeidaoliveira.adv.br</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/40 border border-border/30">
                <span className="text-gold text-xl">📍</span>
                <div>
                  <p className="font-semibold text-foreground">Endereço</p>
                  <p className="text-muted-foreground text-sm">Av. Paulista, 1000 - Conj. 501<br />São Paulo, SP</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/40 border border-border/30">
                <span className="text-gold text-xl">🕐</span>
                <div>
                  <p className="font-semibold text-foreground">Horário</p>
                  <p className="text-muted-foreground text-sm">Seg a Sex: 9h às 18h</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-muted-foreground text-sm border-t border-border/30 pt-6">
            <p className="mb-2">
              ⚖️ <span className="text-gold font-semibold">Almeida & Oliveira Advogados</span>
            </p>
            <p className="text-xs">
              Este documento é confidencial e destinado exclusivamente às partes envolvidas no processo judicial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoLanding;
