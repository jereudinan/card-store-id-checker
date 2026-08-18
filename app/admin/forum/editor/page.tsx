import { requireChatGPTUser } from "../../../chatgpt-auth";
import EditorClient from "./editor-client";

export const dynamic = "force-dynamic";

async function AuthenticatedEditor({ id }: { id: number }) {
  await requireChatGPTUser(`/admin/forum/editor/?id=${id}`);
  return <EditorClient articleId={id} />;
}

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const id = Number((await searchParams).id ?? "1");
  return <AuthenticatedEditor id={Number.isInteger(id) && id > 0 ? id : 1} />;
}
