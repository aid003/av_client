export function DateCell({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <span className="text-sm" title={date}>
      {formatDate(date)}
    </span>
  );
}
