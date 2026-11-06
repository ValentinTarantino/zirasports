import AdminBackLink from "@/components/admin-back-link";

export default function AdminSectionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <AdminBackLink />
    </div>
    {children}
  </>;
}
