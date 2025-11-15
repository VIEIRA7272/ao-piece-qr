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
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center mb-10">
          <Logo />
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-8 bg-card border-border/50 shadow-soft">
            <div className="mb-6">
              <h1 className="text-3xl font-serif text-gold mb-3 font-semibold">
                {peca.titulo_peca || "Peça Processual"}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="font-light">Processo: <span className="font-mono">{peca.processo}</span></span>
              </div>
            </div>

            <div className="aspect-video bg-secondary/50 rounded-xl overflow-hidden shadow-sm">
              <video
                controls
                className="w-full h-full"
                src={peca.video_url}
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>

            {peca.pdf_final_url && (
              <div className="mt-8">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold hover:shadow-lg transition-all"
                  onClick={() => window.open(peca.pdf_final_url!, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Peça em PDF
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-8 bg-card border-border/50 shadow-soft">
            <h2 className="text-xl font-serif text-gold mb-4 font-semibold">
              Sobre o Escritório
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed font-light">
              A Almeida & Oliveira Advogados é um escritório especializado em Direito Bancário, 
              oferecendo soluções jurídicas personalizadas com foco em excelência e resultados. 
              Nossa equipe está comprometida em defender os direitos de nossos clientes com ética 
              e profissionalismo.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <span className="text-primary text-xl">📞</span>
                <div>
                  <p className="font-medium text-foreground">Telefone</p>
                  <p className="text-muted-foreground font-light">(11) 98765-4321</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <span className="text-primary text-xl">📧</span>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground font-light">contato@almeidaoliveira.adv.br</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <span className="text-primary text-xl">📍</span>
                <div>
                  <p className="font-medium text-foreground">Endereço</p>
                  <p className="text-muted-foreground font-light">Av. Paulista, 1000 - Conj. 501<br />São Paulo, SP - CEP 01310-100</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <span className="text-primary text-xl">🕐</span>
                <div>
                  <p className="font-medium text-foreground">Horário de Atendimento</p>
                  <p className="text-muted-foreground font-light">Segunda a Sexta: 9h às 18h</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoLanding;
