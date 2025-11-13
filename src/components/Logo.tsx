export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 rounded-full gradient-gold flex items-center justify-center shadow-lg">
        <span className="text-3xl font-serif font-bold text-primary-foreground">
          AO
        </span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-serif font-bold text-gold">
          Almeida & Oliveira
        </h1>
        <p className="text-sm text-muted-foreground">
          Advocacia Especializada em Direito Bancário
        </p>
      </div>
    </div>
  );
};
