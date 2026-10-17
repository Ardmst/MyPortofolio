"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MailOpen,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Message } from "@/lib/types";
import { formatDate, initials, relativeTime } from "@/lib/utils";

const PAGE_SIZE = 6;

type ReadFilter = "all" | "unread" | "read";

interface MessagesTableProps {
  messages: Message[];
}

export function MessagesTable({ messages }: MessagesTableProps) {
  const [rows, setRows] = useState(messages);
  const [query, setQuery] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Message | null>(null);
  const [target, setTarget] = useState<Message | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return rows.filter((message) => {
      if (readFilter === "unread" && message.is_read) return false;
      if (readFilter === "read" && !message.is_read) return false;
      if (!needle) return true;

      return (
        message.sender_name.toLowerCase().includes(needle) ||
        message.sender_email.toLowerCase().includes(needle) ||
        (message.subject ?? "").toLowerCase().includes(needle) ||
        message.message.toLowerCase().includes(needle)
      );
    });
  }, [rows, query, readFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const unreadCount = rows.filter((message) => !message.is_read).length;

  async function toggleRead(message: Message) {
    const isRead = !message.is_read;
    const response = await fetch(`/api/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: isRead }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      toast.error(payload.error ?? "Could not update the message.");
      return;
    }

    setRows((current) =>
      current.map((row) => (row.id === message.id ? { ...row, is_read: isRead } : row)),
    );
    setOpen((current) => (current && current.id === message.id ? { ...current, is_read: isRead } : current));
    toast.success(isRead ? "Marked as read" : "Marked as unread");
  }

  async function remove(message: Message) {
    const response = await fetch(`/api/messages/${message.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Failed to delete the message.");
    }

    setRows((current) => current.filter((row) => row.id !== message.id));
    toast.success("Message deleted");
  }

  function openMessage(message: Message) {
    setOpen(message);
    if (!message.is_read) void toggleRead(message);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search sender, email, subject or body…"
            aria-label="Search messages"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle transition-colors hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Select
          value={readFilter}
          onValueChange={(value) => {
            setReadFilter(value as ReadFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44" aria-label="Filter by read state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All messages</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
            <SelectItem value="read">Read only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="font-mono text-[0.7rem] text-fg-subtle">
        {filtered.length} of {rows.length} shown · <span className="text-accent-soft">{unreadCount}</span> unread
      </p>

      <div className="rounded-xl border border-edge bg-surface/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Sender</TableHead>
              <TableHead className="hidden md:table-cell">Subject</TableHead>
              <TableHead className="hidden xl:table-cell">Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-fg-subtle">
                  No messages match your filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((message) => (
                <TableRow key={message.id} className={message.is_read ? "" : "bg-accent/[0.04]"}>
                  <TableCell>
                    <span
                      className={`block size-2 rounded-full ${
                        message.is_read ? "bg-edge-strong" : "bg-accent shadow-[0_0_10px_var(--color-accent)]"
                      }`}
                      aria-label={message.is_read ? "read" : "unread"}
                    />
                  </TableCell>

                  <TableCell className="max-w-64">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-edge bg-elevated font-mono text-[0.65rem] text-fg-muted">
                        {initials(message.sender_name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">
                          {message.sender_name}
                          {!message.is_read && (
                            <Badge variant="accent" className="ml-2 align-middle">
                              new
                            </Badge>
                          )}
                        </p>
                        <p className="truncate font-mono text-[0.68rem] text-fg-subtle">
                          {message.sender_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden max-w-80 md:table-cell">
                    <p className="truncate text-sm text-fg-muted">
                      {message.subject || "(no subject)"}
                    </p>
                    <p className="truncate text-xs text-fg-subtle">{message.message}</p>
                  </TableCell>

                  <TableCell className="hidden whitespace-nowrap font-mono text-[0.68rem] xl:table-cell">
                    {relativeTime(message.created_at)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Read message"
                        onClick={() => openMessage(message)}
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={message.is_read ? "Mark as unread" : "Mark as read"}
                        onClick={() => void toggleRead(message)}
                      >
                        {message.is_read ? (
                          <MailOpen className="size-3.5" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete message"
                        onClick={() => setTarget(message)}
                        className="text-danger/80 hover:bg-red-950/40 hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-4 py-3">
          <p className="font-mono text-[0.68rem] text-fg-subtle">
            Page {currentPage} / {pageCount}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage >= pageCount}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message detail */}
      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open?.subject || "(no subject)"}</DialogTitle>
            <DialogDescription>
              <span className="text-fg">{open?.sender_name}</span> ·{" "}
              <a href={`mailto:${open?.sender_email}`} className="text-accent-soft hover:underline">
                {open?.sender_email}
              </a>{" "}
              · {open ? formatDate(open.created_at) : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="whitespace-pre-wrap rounded-lg border border-edge bg-void/60 p-4 text-sm leading-relaxed text-fg-muted">
            {open?.message}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" asChild>
              <a href={`mailto:${open?.sender_email}?subject=Re: ${open?.subject ?? ""}`}>
                <Mail className="size-4" />
                Reply by email
              </a>
            </Button>
            <Button
              variant="subtle"
              onClick={() => open && void toggleRead(open)}
            >
              {open?.is_read ? "Mark as unread" : "Mark as read"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(next) => !next && setTarget(null)}
        title="Delete this message?"
        description={
          <>
            The message from <span className="text-fg">{target?.sender_name}</span> will be
            permanently removed from the inbox. This cannot be undone.
          </>
        }
        confirmLabel="Delete message"
        onConfirm={() => (target ? remove(target) : Promise.resolve())}
        onConfirmed={() => setTarget(null)}
      />
    </div>
  );
}
