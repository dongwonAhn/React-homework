import { useEffect, useMemo, useState } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";
import CardList from "./components/CardList";
import { USERS } from "./data/users";

function App() {
  const [keyword, setKeyword] = useState("");

  // URL → state 초기화
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setKeyword(params.get("name") ?? "");
  }, []);

  // popstate (뒤/앞 버튼)
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setKeyword(params.get("name") ?? "");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // URL 동기화
  const applyQueryToURL = () => {
    const params = new URLSearchParams(window.location.search);
    if (keyword) params.set("name", keyword);
    else params.delete("name");
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", next);
  };

  // 필터링
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
  }, [keyword]);

  return (
    <div className="container">
      <h1 className="page-title">검색 카드 리스트</h1>

      <SearchForm
        value={keyword}
        onChange={setKeyword}
        onSubmit={applyQueryToURL}
      />

      <CardList items={filtered} />
    </div>
  );
}

export default App;
