// 端末（ブラウザ）にだけ保存する小さな記録。使えない環境では保存せずに動く。
export function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存できなくても画面はそのまま使える
  }
}
