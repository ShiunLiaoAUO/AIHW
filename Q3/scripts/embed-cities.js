import { client } from "../lib/openai.js";
import {
  qdrant,
  CITIES_COLLECTION,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "../lib/qdrant.js";

// 準備 5 筆台灣城市知識庫資料
const citiesData = [
  {
    id: 1,
    city: "台北市",
    feature: "首都、捷運便利、台北101",
    description: "台北市是台灣的首都與經濟中心，擁有四通八達的捷運網路、地標台北101，以及豐富的夜市文化與現代化商業區。",
  },
  {
    id: 2,
    city: "台中市",
    feature: "藝文氣息、氣候舒適、綠園道",
    description: "台中市以舒適的氣候、寬敞的街道與濃厚的藝文氣息聞名，擁有勤美誠品綠園道、國家歌劇院及豐富的特色美景。",
  },
  {
    id: 3,
    city: "高雄市",
    feature: "港都風情、駁二藝術特區、熱情陽光",
    description: "高雄市是著名的南台灣港都，擁有美麗的海港風光、駁二藝術特區的文創產業，以及捷運沿線便利的觀光景點。",
  },
  {
    id: 4,
    city: "台南市",
    feature: "古都、歷史古蹟、小吃天堂",
    description: "台南市是台灣歷史最悠久的古都，保存大量國定古蹟與廟宇，並以豐富且美味的在地傳統小吃（如牛肉湯、擔仔麵）聞名全台。",
  },
  {
    id: 5,
    city: "花蓮縣",
    feature: "好山好水、太魯閣峽谷、自然景觀",
    description: "花蓮縣位於台灣東部，以壯麗的太魯閣國家公園峽谷風光、清澈的太平洋海岸與純淨的大自然環境成為度假勝地。",
  },
];

function cityToText(item) {
  return [
    item.city,
    item.feature,
    item.description,
  ].filter(Boolean).join(" | ");
}

async function recreateCollection() {
  const exists = await qdrant.collectionExists(CITIES_COLLECTION);
  if (exists.exists) {
    await qdrant.deleteCollection(CITIES_COLLECTION);
  }
  await qdrant.createCollection(CITIES_COLLECTION, {
    vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
  });
}

async function embedBatch(texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function main() {
  console.log(`準備載入 ${citiesData.length} 筆台灣城市資料...`);

  await recreateCollection();
  console.log(`已建立 collection: ${CITIES_COLLECTION}`);

  const texts = citiesData.map(cityToText);
  const vectors = await embedBatch(texts);

  const points = citiesData.map((item, idx) => ({
    id: item.id,
    vector: vectors[idx],
    payload: {
      city: item.city,
      feature: item.feature,
      description: item.description,
    },
  }));

  await qdrant.upsert(CITIES_COLLECTION, { wait: true, points });
  console.log(`成功灌入 ${citiesData.length} 筆資料到 ${CITIES_COLLECTION}！`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});