import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Video, FileCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <Logo />
          <p className="text-lg text-muted-foreground mt-8 max-w-2xl">
            Sistema de gestão de peças processuais com vídeos explicativos.
            Simplifique a comunicação com seus clientes através de tecnologia.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-card border-border hover:border-primary transition-colors">
              <Upload className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-serif mb-2 text-gold">1. Upload</h3>
              <p className="text-muted-foreground text-sm">
                Envie o PDF da peça e grave um vídeo explicativo
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary transition-colors">
              <FileCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-serif mb-2 text-gold">2. Processamento</h3>
              <p className="text-muted-foreground text-sm">
                Sistema gera QR Code e insere no PDF automaticamente
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary transition-colors">
              <Video className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-serif mb-2 text-gold">3. Compartilhe</h3>
              <p className="text-muted-foreground text-sm">
                Cliente acessa vídeo via QR Code ou link direto
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6"
              onClick={() => navigate("/enviar")}
            >
              <Upload className="mr-2 h-5 w-5" />
              Enviar Nova Peça
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
