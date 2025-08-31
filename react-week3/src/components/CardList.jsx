import CardItem from "./CardItem";

function CardList({ items }) {
  if (!items.length) {
    return <p className="empty">검색 결과가 없습니다.</p>;
  }
  return (
    <section aria-live="polite">
      <h2 className="sr-only">검색 결과</h2>
      <div className="grid">
        {items.map((u) => (
          <CardItem key={u.id} name={u.name} role={u.role} avatar={u.avatar} />
        ))}
      </div>
    </section>
  );
}
export default CardList;
