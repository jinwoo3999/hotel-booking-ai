export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Chỉ render children, không thêm bất kỳ khung hay background nào
    <>
      {children}
    </>
  );
}