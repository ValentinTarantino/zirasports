export default function SectionLoading() {
  return <div className="flex min-h-[60vh] items-center justify-center bg-white" role="status" aria-label="Cargando sección">
    <span aria-hidden="true" className="h-20 w-20 animate-spin rounded-full border-[6px] border-zinc-200 border-t-pink-500 motion-reduce:animate-none" />
    <span className="sr-only">Cargando sección...</span>
  </div>;
}
