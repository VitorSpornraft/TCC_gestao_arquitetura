export default function FileDropzone({
  arquivoSelecionado,
  isDragging,
  setIsDragging,
  fileInputRef,
  fluxoVersao,
  setFluxoVersao,
  aoEscolherArquivo,
  cancelarUpload,
  fazerUploadECommit,
}) {
  return (
    <>
      <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
        Upload de Documentos
      </h3>

      {!arquivoSelecionado ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.length)
              aoEscolherArquivo({ target: { files: e.dataTransfer.files } });
          }}
          className={`border-2 border-dashed rounded-2xl p-6 mb-6 transition-all flex flex-col sm:row items-center justify-between gap-6 bg-white ${
            isDragging
              ? "border-indigo-400 bg-indigo-50/50 scale-[1.01]"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <svg
                className="text-indigo-600"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 m-0 mb-0.5">
                Arraste arquivos para esta pasta
              </p>
              <p className="text-xs text-slate-500 m-0">
                Plantas (PDF, DWG), memoriais ou imagens.
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={aoEscolherArquivo}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Procurar Arquivo
          </button>
        </div>
      ) : fluxoVersao.passo === 0 ? (
        <div className="mb-8 px-5 py-4 bg-white border border-slate-200 rounded-xl shadow-lg animate-fadeIn flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">
                {arquivoSelecionado.name}
              </span>
              <span className="text-xs text-slate-500">
                Arquivo selecionado
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={cancelarUpload}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => fazerUploadECommit(false)}
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Salvar como Novo
            </button>
            <button
              onClick={() => setFluxoVersao({ ...fluxoVersao, passo: 1 })}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>{" "}
              Adicionar como Versão
            </button>
          </div>
        </div>
      ) : null}

      {fluxoVersao.passo === 2 && (
        <div className="sticky top-4 z-40 mb-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-bold">
              2
            </span>
            <div>
              <p className="font-bold m-0 text-base">
                Selecione o Arquivo Original
              </p>
              <p className="text-indigo-100 text-xs m-0">
                Navegue pelas pastas abaixo e clique no arquivo que receberá a
                versão nova.
              </p>
            </div>
          </div>
          <button
            onClick={cancelarUpload}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium cursor-pointer transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </>
  );
}
