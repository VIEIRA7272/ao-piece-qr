import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Video, FileCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center text-center mb-20">
          <Logo />
          <p className="text-base text-muted-foreground mt-10 max-w-xl font-light leading-relaxed">
            Conecte suas peças processuais com vídeos explicativos através de QR Code.
            Comunicação moderna e eficiente com seus clientes.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 bg-card border-border/50 hover-lift hover:border-primary/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3 text-gold font-semibold">Upload</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                Envie o PDF da peça e grave um vídeo explicativo em poucos passos
              </p>
            </Card>

            <Card className="p-8 bg-card border-border/50 hover-lift hover:border-primary/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <FileCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3 text-gold font-semibold">Processamento</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                QR Code gerado e inserido automaticamente no PDF
              </p>
            </Card>

            <Card className="p-8 bg-card border-border/50 hover-lift hover:border-primary/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Video className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-serif mb-3 text-gold font-semibold">Compartilhe</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                Cliente acessa o vídeo escaneando o QR Code ou através do link
              </p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-10 shadow-gold hover:shadow-lg transition-all"
              onClick={() => navigate("/enviar")}
            >
              <Upload className="mr-2 h-5 w-5" />
              Enviar Nova Peça
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-medium px-10 hover-lift"
              onClick={() => navigate("/historico")}
            >
              <FileCheck className="mr-2 h-5 w-5" />
              Ver Histórico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
