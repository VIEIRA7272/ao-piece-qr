export const Logo = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
        <span className="text-2xl font-serif font-bold text-primary-foreground tracking-tight">
          AO
        </span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-serif font-semibold text-gold tracking-tight">
          Almeida & Oliveira
        </h1>
        <p className="text-xs text-muted-foreground font-light">
          Advocacia Especializada em Direito Bancário
        </p>
      </div>
    </div>
  );
};
