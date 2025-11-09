"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/ui/components/ui/resizable";
import { ChatList } from "@/widgets/chat-list";
import { ChatView } from "@/widgets/chat-view";

export default function MessagesPage() {
  return (
    <div className="h-screen flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <ChatList />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50}>
          <ChatView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
