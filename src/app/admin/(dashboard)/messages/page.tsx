import { Inbox, MailWarning } from "lucide-react";
import { MessagesTable } from "@/components/admin/messages-table";
import { listMessages } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await listMessages();
  const unread = messages.filter((message) => !message.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent">
            {"// inbox"}
          </p>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            <Inbox className="size-6 text-accent" />
            Message Inbox
          </h1>
          <p className="text-sm text-fg-muted">
            Submissions from the public contact form. Mark them read or delete them.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-edge bg-surface/60 px-4 py-3">
          <MailWarning className={`size-4 ${unread > 0 ? "text-accent" : "text-fg-subtle"}`} />
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-fg-subtle">
              unread
            </p>
            <p className="font-display text-lg font-semibold text-fg">
              {unread} <span className="text-sm font-normal text-fg-subtle">/ {messages.length}</span>
            </p>
          </div>
        </div>
      </div>

      <MessagesTable messages={messages} />
    </div>
  );
}
