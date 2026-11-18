import Database from 'better-sqlite3'
const db = new Database('foobar.db', {})
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS nfts (
    id TEXT PRIMARY KEY,

    collection_name TEXT NOT NULL,  
    item_number INTEGER,            
    model_name TEXT NOT NULL,       
    backdrop_name TEXT NOT NULL,   

    price REAL NOT NULL,           
    marketplace TEXT NOT NULL,      
    photo_url TEXT,
    telegram_link TEXT,
    listed_at DATETIME,             

    last_seen DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_model_backdrop ON nfts (collection_name, backdrop_name);
CREATE INDEX IF NOT EXISTS idx_model ON nfts (collection_name);


CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nft_id TEXT NOT NULL,             
    notified_price REAL NOT NULL,     
    notified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nft_id) REFERENCES nfts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_stats (
    collection_name TEXT NOT NULL,
    backdrop_name TEXT NOT NULL,
    model_name TEXT NOT NULL,

    avg_price REAL,          -- Средняя цена
    min_price REAL,          -- Минимальная цена (очень важна для поиска лучших предложений)
    max_price REAL,          -- Максимальная цена
    item_count INTEGER,      -- Количество товаров в этой группе

    last_updated DATETIME NOT NULL,

    PRIMARY KEY (collection_name, backdrop_name)
);
`)

export default db
