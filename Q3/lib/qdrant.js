import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_API_KEY } from "../config.js";
import { client } from "./openai.js";

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
  checkCompatibility: false,
});

export const NETFLIX_COLLECTION = "netflix";
// 新增：台灣城市介紹的 Collection 名稱
export const CITIES_COLLECTION = "taiwan_cities";

export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

// 原有的 Netflix 搜尋
export async function searchNetflix(query, limit = 5) {
  const vector = await embed(query);

  const results = await qdrant.search(NETFLIX_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    title: r.payload.title,
    type: r.payload.type,
    release_year: r.payload.release_year,
    description: r.payload.description,
    listed_in: r.payload.listed_in,
  }));
}

// 新增：台灣城市搜尋函式
export async function searchCities(query, limit = 3) {
  const vector = await embed(query);

  const results = await qdrant.search(CITIES_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    city: r.payload.city,
    feature: r.payload.feature,
    description: r.payload.description,
  }));
}