import ChatApp from "@/components/chat/chat-app"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  return <ChatApp conversationId={conversationId} />
}
