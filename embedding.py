from transformers import AutoTokenizer, AutoModel
import torch
import sys
import json

model_name = "sentence-transformers/all-MiniLM-L6-v2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

def generate_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state.mean(dim=1)
    return embeddings[0].numpy().tolist()

if __name__ == "__main__":
    text = sys.stdin.read()
    embedding = generate_embedding(text)
    print(json.dumps(embedding))
