import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Search, FileText, Video, Download, QrCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Peca {
  id: string;
  processo: string;
  titulo_peca: string | null;
  video_url: string;
  pdf_final_url: string | null;
  qr_code_url: string | null;
  slug: string;
  created_at: string;
}

const Historico = () => {
  const navigate = useNavigate();
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [filteredPecas, setFilteredPecas] = useState<Peca[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPecas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPecas(pecas);
    } else {
      const filtered = pecas.filter((peca) =>
        peca.processo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPecas(filtered);
    }
  }, [searchTerm, pecas]);

  const fetchPecas = async () => {
    try {
      const { data, error } = await supabase
        .from("videos_pecas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPecas(data || []);
      setFilteredPecas(data || []);
    } catch (error) {
      console.error("Erro ao buscar peças:", error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <Logo />
          <Button variant="outline" onClick={() => navigate("/enviar")} className="hover-lift">
            Nova Peça
          </Button>
        </div>

        <Card className="p-8 bg-card border-border/50 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-gold font-semibold">Histórico de Peças</h2>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de processo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-secondary/50 border-border/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground font-light">Carregando...</p>
            </div>
          ) : filteredPecas.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-light">
                {searchTerm ? "Nenhuma peça encontrada" : "Nenhuma peça cadastrada"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="font-medium">Processo</TableHead>
                    <TableHead className="font-medium">Título</TableHead>
                    <TableHead className="font-medium">Data</TableHead>
                    <TableHead className="text-right font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPecas.map((peca) => (
                    <TableRow key={peca.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
                      <TableCell className="font-medium font-mono text-sm">{peca.processo}</TableCell>
                      <TableCell className="font-light">{peca.titulo_peca || "Sem título"}</TableCell>
                      <TableCell className="font-light text-muted-foreground">{formatDate(peca.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/v/${peca.slug}`, "_blank")}
                            title="Ver página"
                            className="hover-lift"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {peca.pdf_final_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = peca.pdf_final_url!;
                                link.download = `peca_${peca.slug}.pdf`;
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              title="Baixar PDF"
                              className="hover-lift"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {peca.qr_code_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(peca.qr_code_url!, "_blank")}
                              title="Ver QR Code"
                              className="hover-lift"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(peca.video_url, "_blank")}
                            title="Ver vídeo"
                            className="hover-lift"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Historico;
