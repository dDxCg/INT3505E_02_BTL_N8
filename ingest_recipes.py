import pandas as pd
import chromadb
import ollama
from chromadb.utils import embedding_functions

# Configuration
CSV_FILE = "recipes.csv"  # Make sure your CSV file is named this
DB_PATH = "./recipe_db"   # Where to save the database
COLLECTION_NAME = "recipes"
EMBED_MODEL = "nomic-embed-text"

def prepare_data():
    print(f"Loading {CSV_FILE}...")
    try:
        df = pd.read_csv(CSV_FILE)
    except FileNotFoundError:
        print("Error: recipes.csv not found. Please ensure the file exists.")
        return None

    # Fill empty fields to prevent errors
    df = df.fillna("Unknown")

    documents = []
    metadatas = []
    ids = []

    print(f"Processing {len(df)} recipes...")

    for index, row in df.iterrows():
        # 1. Create a readable text chunk for the LLM
        # We replace pipes '|' with commas to make it flow better as natural text
        ingredients = row['ingredients'].replace('|', ', ')
        instructions = row['instructions'].replace('|', '\n')
        
        text_blob = (
            f"Title: {row['recipe_title']}\n"
            f"Description: {row['description']}\n"
            f"Cuisine: {row['cuisine']} | Diet: {row['diet']}\n"
            f"Ingredients: {ingredients}\n"
            f"Instructions:\n{instructions}"
        )

        documents.append(text_blob)
        
        # 2. Store useful metadata (for filtering or reference later)
        metadatas.append({
            "title": row['recipe_title'],
            "url": row['url'],
            "rating": str(row['rating']), # Chroma handles strings best
            "cuisine": row['cuisine']
        })
        
        ids.append(str(index))

    return documents, metadatas, ids

def ingest():
    docs, metas, ids = prepare_data()
    if not docs: return

    print("Initializing Database...")
    # PersistentClient saves data to disk
    client = chromadb.PersistentClient(path=DB_PATH) 
    
    # Delete collection if it exists to avoid duplicates during testing
    try:
        client.delete_collection(COLLECTION_NAME)
    except:
        pass

    collection = client.create_collection(name=COLLECTION_NAME)

    print("Generating embeddings and storing... (This may take a few minutes)")
    
    # Batch processing to handle 5000 lines efficiently
    batch_size = 100
    total_batches = len(docs) // batch_size + (1 if len(docs) % batch_size != 0 else 0)

    for i in range(0, len(docs), batch_size):
        batch_docs = docs[i : i + batch_size]
        batch_metas = metas[i : i + batch_size]
        batch_ids = ids[i : i + batch_size]

        # Generate embeddings using Ollama
        embeddings = []
        for doc in batch_docs:
            response = ollama.embeddings(model=EMBED_MODEL, prompt=doc)
            embeddings.append(response["embedding"])

        collection.add(
            ids=batch_ids,
            embeddings=embeddings,
            documents=batch_docs,
            metadatas=batch_metas
        )
        print(f"Processed batch {i//batch_size + 1}/{total_batches}")

    print(f"Successfully saved {len(docs)} recipes to {DB_PATH}")

if __name__ == "__main__":
    ingest()