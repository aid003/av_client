export function PriceCell({ price }: { price: string }) {
  const formatPrice = (price: string) => {
    const num = parseInt(price, 10);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return <span className="font-semibold">{formatPrice(price)}</span>;
}
