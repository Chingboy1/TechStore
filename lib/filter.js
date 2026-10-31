const removeAccents = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const byPrice = (dir) => (a, b) => {
  if (a.price == null && b.price == null) return 0;
  if (a.price == null) return 1;
  if (b.price == null) return -1;
  return (a.price - b.price) * dir;
};

export function filterProducts(products, { category, q, brand, min, max, sort } = {}) {
  const words = q ? removeAccents(q).split(/\s+/).filter(Boolean) : [];
  const searchQueryWithDash = q ? removeAccents(q).replace(/\s+/g, '-') : '';

  const list = products.filter((p) => {
    // Lọc theo danh mục
    if (category && p.category !== category) return false;
    // Lọc theo thương hiệu
    if (brand && p.brand !== brand) return false;
    // Lọc theo giá
    if (min && (p.price == null || p.price < Number(min))) return false;
    if (max && (p.price == null || p.price > Number(max))) return false;
    
    // Lọc theo từ khóa tìm kiếm (tìm cả tên và danh mục)
    if (words.length) {
      const name = removeAccents(p.name);
      const cat = removeAccents(p.category);
      const isMatch = words.every((w) => name.includes(w) || cat.includes(w) || cat.includes(searchQueryWithDash));
      if (!isMatch) return false;
    }
    return true;
  });

  // Sắp xếp
  if (sort === "price-asc") list.sort(byPrice(1));
  if (sort === "price-desc") list.sort(byPrice(-1));
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return list;
}

export function getBrands(products, category) {
  const set = new Set(
    products.filter((p) => (!category || p.category === category) && p.brand).map((p) => p.brand)
  );
  return [...set].sort((a, b) => a.localeCompare(b, "vi"));
}