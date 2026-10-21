import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './ProductList.css';

const INITIAL_PRODUCTS = [
  { id: 1, title: 'Abbey Road', artist: 'The Beatles', price: 3500, genre: 'Rock', format: 'Vinyl' },
  { id: 2, title: 'Nevermind', artist: 'Nirvana', price: 1200, genre: 'Grunge', format: 'CD' },
  { id: 3, title: 'Random Access Memories', artist: 'Daft Punk', price: 4200, genre: 'Electronic', format: 'Vinyl' },
];

function ProductList() {
  // Основное состояние: список товаров (синхронизируется с localStorage)
  const [products, setProducts] = useLocalStorage('products', INITIAL_PRODUCTS);

  // Поля формы
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');

  // Фильтр и сортировка
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Статус автосохранения (для debounce)
  const [saveStatus, setSaveStatus] = useState('saved');

  // Имитация загрузки
  const [isLoading, setIsLoading] = useState(true);

  // ЭФФЕКТ 1: изменение заголовка вкладки
  useEffect(() => {
    document.title = `Каталог (${products.length} товаров)`;
  }, [products.length]);

  // ЭФФЕКТ 2: имитация загрузки при монтировании (1 секунда)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ЭФФЕКТ 3: debounce автосохранения (500 мс)
  useEffect(() => {
    setSaveStatus('saving');

    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [products]);

  // Добавить товар
  function handleAdd(e) {
    e.preventDefault();

    if (!title.trim() || !artist.trim() || !price) {
      alert('Заполните все поля');
      return;
    }

    const newProduct = {
      id: Date.now(),
      title: title.trim(),
      artist: artist.trim(),
      price: Number(price),
      genre: 'Other',
      format: 'Vinyl',
    };

    setProducts([...products, newProduct]);

    setTitle('');
    setArtist('');
    setPrice('');
  }

  // Удалить товар
  function handleDelete(id) {
    setProducts(products.filter(p => p.id !== id));
  }

  // Фильтр + сортировка
  const visibleProducts = products
    .filter(p => filterGenre === 'all' || p.genre === filterGenre)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  if (isLoading) {
    return <p className="loading">Загрузка каталога...</p>;
  }

  return (
    <div className="product-list">
      <h1>Каталог музыкальных товаров</h1>

      <div className={`save-status ${saveStatus}`}>
        {saveStatus === 'saving' ? '💾 Сохранение...' : '✓ Сохранено'}
      </div>

      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Исполнитель"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <input
          type="number"
          placeholder="Цена"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>

      <div className="controls">
        <label>
          Жанр:
          <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
            <option value="all">Все</option>
            <option value="Rock">Rock</option>
            <option value="Grunge">Grunge</option>
            <option value="Electronic">Electronic</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Сортировка:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">По умолчанию</option>
            <option value="price-asc">Цена ↑</option>
            <option value="price-desc">Цена ↓</option>
            <option value="title">По названию</option>
          </select>
        </label>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="empty">Нет товаров по фильтру</p>
      ) : (
        <ul className="items">
          {visibleProducts.map(product => (
            <li key={product.id} className="item">
              <div>
                <strong>{product.title}</strong> — {product.artist}
                <span className="price">{product.price} ₽</span>
                <span className="meta">({product.genre}, {product.format})</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(product.id)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="stats">
        Всего товаров: {products.length} | Показано: {visibleProducts.length}
      </p>
    </div>
  );
}

export default ProductList;