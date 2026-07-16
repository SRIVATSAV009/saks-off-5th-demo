export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function Money({ amount }: { amount: number }) {
  return <>{formatMoney(amount)}</>;
}
