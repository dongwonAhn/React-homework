function CardItem({ name, role, avatar }) {
  return (
    <article className="card">
      <img className="card__thumb" src={avatar} alt={`${name} 프로필 이미지`} />
      <div className="card__body">
        <h3 className="card__title">{name}</h3>
        <p className="card__meta">{role}</p>
      </div>
    </article>
  );
}
export default CardItem;
