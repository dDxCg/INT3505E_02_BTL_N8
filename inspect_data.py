import streamlit as st
import pandas as pd

# Configuration
CSV_FILE = "recipes.csv"
LIMIT = 10  # Only check first 100 items

def load_and_format():
    df = pd.read_csv(CSV_FILE).head(LIMIT)
    
    formatted_docs = []
    
    for index, row in df.iterrows():
        # Mimic your exact cleaning logic here
        ingredients = str(row['ingredients']).replace('|', ', ')
        instructions = str(row['instructions']).replace('|', '\n')
        
        text_blob = (
            f"Title: {row['recipe_title']}\n"
            f"Description: {row['description']}\n"
            f"Cuisine: {row['cuisine']} | Diet: {row['diet']}\n"
            f"Ingredients: {ingredients}\n"
            f"Instructions:\n{instructions}"
        )
        formatted_docs.append({
            "Original Index": index,
            "Title": row['recipe_title'],
            "LLM View (The Document)": text_blob,
            "Metadata (Cuisine)": row['cuisine']
        })
    
    return formatted_docs

st.set_page_config(layout="wide")
st.title("🧐 RAG Data Inspector")
st.write(f"Previewing the first {LIMIT} items to check for CSV corruption.")

data = load_and_format()

# Sidebar for navigation
selected_index = st.sidebar.number_input("Select Row Index", min_value=0, max_value=len(data)-1, value=0)
entry = data[selected_index]

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Raw Metadata")
    st.json({
        "Title": entry["Title"],
        "Cuisine": entry["Metadata (Cuisine)"],
        "Index": entry["Original Index"]
    })

    st.warning("⚠️ Check below: If the Title is empty or 'Ingredients' looks like a description, your CSV has a newline glitch.")

with col2:
    st.subheader("🔎 What the LLM Sees")
    st.text_area("Content", entry["LLM View (The Document)"], height=500)