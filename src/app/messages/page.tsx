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
    <div className="-m-2 h-[calc(100vh-2.3rem)] overflow-hidden max-w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full max-w-full">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="overflow-x-hidden max-w-full">
          <ChatList />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50} className="overflow-x-hidden max-w-full">
          <ChatView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
