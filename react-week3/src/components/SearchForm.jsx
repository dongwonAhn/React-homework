import { useId } from "react";

function SearchForm({ value, onChange, onSubmit }) {
  const inputId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor={inputId} className="sr-only">
        이름으로 검색
      </label>
      <input
        id={inputId}
        className="search-input"
        type="search"
        name="name"
        placeholder="유저 이름 검색"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      <button className="search-button" type="submit">
        검색
      </button>
    </form>
  );
}

export default SearchForm;
