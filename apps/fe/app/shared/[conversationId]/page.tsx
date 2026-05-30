import ChatApp from "@/components/chat/chat-app"

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  return <ChatApp conversationId={conversationId} readOnly />
}
