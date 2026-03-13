import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PageProps): Promise<never> {
  const { id } = await params;
  redirect(`/result?postId=${id}`);
}
