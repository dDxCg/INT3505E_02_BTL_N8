import ollama
import chromadb

# Configuration
DB_PATH = "./recipe_db"
COLLECTION_NAME = "recipes"
LLM_MODEL = "gemma3:4b"
EMBED_MODEL = "nomic-embed-text"

def get_embedding(text):
    return ollama.embeddings(model=EMBED_MODEL, prompt=text)['embedding']

def process_message(user_input: str, stream: bool = True):
    """
    Process user message and yield responses in chunks for streaming.
    This function is designed to be used with FastAPI StreamingResponse.
    """
    # Load the existing database
    client = chromadb.PersistentClient(path=DB_PATH)
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
    except Exception as e:
        yield f"Error loading database: {e}\n"
        yield "Did you run 'ingest_recipes.py' first?\n"
        return

    # Step 1: Check if we need to query the database
    use_RAG_prompt = (
        "You are a culinary assistant for my eatery.\n"
        "Your answers must ONLY use information from our recipe database.\n"
        f"\n\nCustomer input : '{user_input}'\n"
        f"Based on the customer's input, should we query our recipe database ?\n\n"
        f"(IMPORTANT) THIS IS A YES / NO QUESTION, ANSWER WITH 'YES' OR 'NO'\n"
        f"(IMPORTANT) WE ONLY QUERY THE DATABASE IF THEIR REQUEST IS ABOUT THE FOOD\n"
    )
    
    messages = [{"role": "system", "content": use_RAG_prompt}]
    
    try:
        # Get RAG verdict (non-streaming for decision)
        response = ollama.chat(
            model=LLM_MODEL,
            messages=messages,
            stream=False
        )
        rag_verdict = response['message']['content'].lower()

        if "yes" in rag_verdict:
            yield "[PHASE:LOADING] Fetching the menu"
            # Query the database
            query_vec = get_embedding(user_input)
            results = collection.query(
                query_embeddings=[query_vec],
                n_results=5  
            )

            retrieved_docs = results['documents'][0]
            retrieved_metas = results['metadatas'][0]
            
            context_text = ""
            for i, doc in enumerate(retrieved_docs):
                url = retrieved_metas[i].get('url', 'N/A')
                context_text += f"\n--- Recipe Option {i+1} ---\n{doc}\nSource URL: {url}\n"

            # Generate response with context
            validate_RAG_prompt = (
                f"Question: {user_input}"
                f"\nAnswer (from recipe database):\n{context_text}\n\n"
                f"\n(IMPORTANT) IF THE ANSWER MATCH THE QUESTION, KEEP MOST OF ITS ORIGINAL CONTENT AND FILTER OUT IRRELEVANT INFO"
                f"\n(IMPORTANT) IF THE ANSWER DOESN'T MATCH THE QUESTION, RESPONSE WITH 'SORRY, I CAN'T HELP YOU WITH THAT'"
            )
            
            messages = [{"role": "system", "content": validate_RAG_prompt}]
            
            if stream:
                # Stream the response
                stream_iterator = ollama.chat(
                    model=LLM_MODEL,
                    messages=messages,
                    stream=True
                )

                for chunk in stream_iterator:
                    part = chunk['message']['content']
                    yield part
            else:
                response = ollama.chat(
                    model=LLM_MODEL,
                    messages=messages,
                    stream=False
                )
                yield response['message']['content']
        else:
            yield "I can only help with questions about our recipes and menu items. Please ask about our food!"
            
    except Exception as e:
        yield f"\nError during LLM call: {e}"


def start_chat():
    """CLI interface for testing"""
    # Load the existing database
    client = chromadb.PersistentClient(path=DB_PATH)
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
    except Exception as e:
        print(f"Error loading database: {e}")
        print("Did you run 'ingest_recipes.py' first?")
        return

    print(f"--- Chef Gemma ({LLM_MODEL}) is ready ---")
    print(f"Loaded {collection.count()} recipes from knowledge base.")
    print("Ask for a recipe, ingredients, or cooking advice. Type 'exit' to quit.\n")

    while True:
        user_input = input("\nYou: ")
        
        if user_input.lower() in ['exit', 'quit']:
            print("Goodbye!")
            break
            
        print("\nChef Gemma: ", end="", flush=True)
        
        for chunk in process_message(user_input, stream=True):
            print(chunk, end="", flush=True)
        
        print()  # New line after response


if __name__ == "__main__":
    start_chat()